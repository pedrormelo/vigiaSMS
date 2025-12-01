// Shared Google Charts loader utility
// Ensures the loader script is injected once and returns a promise that resolves
// when google.charts is ready to use.

type GoogleChartsLoaderStatus = 'ready' | 'timeout' | 'error';

interface GoogleVisualizationNamespace {
    [key: string]: unknown;
    DataTable?: new (...args: unknown[]) => unknown;
    PieChart?: unknown;
    arrayToDataTable?: (data: unknown[][], firstRowIsData?: boolean) => unknown;
}

interface GoogleChartsNamespace {
    load: (version: 'current', options: { packages: string[] }) => void;
    setOnLoadCallback: (callback: () => void) => void;
}

interface GoogleGlobal {
    charts?: GoogleChartsNamespace;
    visualization?: GoogleVisualizationNamespace;
}

declare global {
    interface Window {
        google?: GoogleGlobal;
        __googleChartsLoaderStatus?: GoogleChartsLoaderStatus;
    }
}

let loaderPromise: Promise<GoogleGlobal> | null = null;

export function loadGoogleCharts(packages: string[] = ['corechart', 'bar']): Promise<GoogleGlobal> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Google Charts can only be loaded in the browser'));
    }

    // If google.visualization already exists AND the core packages seem loaded, resolve immediately.
    // (Esta verificação é otimista, mas agora verifica PieChart)
    const existingGoogle = window.google;
    if (existingGoogle && existingGoogle.visualization?.PieChart) {
        return Promise.resolve(existingGoogle);
    }

    if (!loaderPromise) {
        loaderPromise = new Promise<GoogleGlobal>((resolve, reject) => {
            try {
                const existing = document.querySelector('script[data-google-charts-loader]');
                const debug = (...args: unknown[]) => {
                    if (typeof console !== 'undefined' && (console.debug || console.log)) {
                        (console.debug || console.log)('[googleCharts]', ...args)
                    }
                }

                const finishWhenVisualizationReady = () => {
                    // Poll until google.visualization AND DataTable constructor are available
                    const start = Date.now();
                    const timeoutMs = 12000;
                    const interval = setInterval(() => {
                        const g = window.google;
                        if (g && g.visualization && typeof g.visualization.DataTable === 'function') {
                            clearInterval(interval);
                            debug('google.visualization.DataTable ready (polled)');
                            window.__googleChartsLoaderStatus = 'ready';
                            resolve(g);
                            return;
                        }
                        if (Date.now() - start > timeoutMs) {
                            clearInterval(interval);
                            reject(new Error('Timed out waiting for google.visualization.DataTable'));
                            return;
                        }
                    }, 120);
                };

                if (!existing) {
                    debug('Injecting google charts loader script')
                    const script = document.createElement('script')
                    script.src = 'https://www.gstatic.com/charts/loader.js'
                    script.async = true
                    script.setAttribute('data-google-charts-loader', 'true')
                    script.onload = () => {
                        debug('loader script onload')
                        try {
                            window.google?.charts?.load('current', { packages })

                            const timeoutMs = 12000
                            let timeoutId: number | undefined

                            const clear = () => {
                                if (timeoutId) {
                                    clearTimeout(timeoutId)
                                    timeoutId = undefined
                                }
                            }

                            window.google?.charts?.setOnLoadCallback(() => {
                                clear()
                                debug('google.charts.setOnLoadCallback fired')
                                window.__googleChartsLoaderStatus = 'ready'
                                const googleInstance = window.google
                                if (!googleInstance) {
                                    reject(new Error('Google Charts callback fired without global google object'))
                                    return
                                }
                                resolve(googleInstance)
                            })

                            timeoutId = window.setTimeout(() => {
                                debug('timeout waiting google.charts.setOnLoadCallback')
                                window.__googleChartsLoaderStatus = 'timeout'
                                reject(new Error('Timed out loading Google Charts'))
                            }, timeoutMs)

                            // Also start polling as a fallback in case setOnLoadCallback never fires
                            finishWhenVisualizationReady()
                        } catch (err) {
                            debug('error during onload handling', err)
                            window.__googleChartsLoaderStatus = 'error'
                            reject(err)
                        }
                    }
                    script.onerror = () => {
                        debug('loader script error')
                        window.__googleChartsLoaderStatus = 'error'
                        reject(new Error('Failed to load Google Charts script'))
                    }
                    document.head.appendChild(script)
                } else {
                    debug('loader script already present')
                    // Se o script já existe, a lógica de fallback (com polling) é aceitável
                    const googleInstance = window.google;
                    if (googleInstance && googleInstance.visualization && typeof googleInstance.visualization.DataTable === 'function') {
                        debug('google.visualization.DataTable already available')
                        resolve(googleInstance)
                    } else if (googleInstance?.charts) {
                        debug('google.charts present, calling load')
                        try {
                            googleInstance.charts.load('current', { packages })
                            googleInstance.charts.setOnLoadCallback(() => {
                                debug('google.charts.setOnLoadCallback fired (existing script)')
                                window.__googleChartsLoaderStatus = 'ready'
                                const updatedGoogle = window.google
                                if (!updatedGoogle) {
                                    reject(new Error('Google Charts callback fired without global google object'))
                                    return
                                }
                                resolve(updatedGoogle)
                            })
                            // O polling aqui é OK como fallback caso o callback falhe
                            finishWhenVisualizationReady() 
                        } catch (err) {
                                    debug('error while calling google.charts.load', err)
                                    window.__googleChartsLoaderStatus = 'error'
                                    reject(err)
                        }
                    } else {
                        debug('waiting for existing script load event')
                        const onLoad = () => {
                            try {
                                window.google?.charts?.load('current', { packages })
                                window.google?.charts?.setOnLoadCallback(() => {
                                    debug('google.charts.setOnLoadCallback fired (after existing load)')
                                    const reloadedGoogle = window.google
                                    if (!reloadedGoogle) {
                                        reject(new Error('Google Charts callback fired without global google object'))
                                        return
                                    }
                                    resolve(reloadedGoogle)
                                })
                                finishWhenVisualizationReady()
                            } catch (err) {
                                debug('error after existing script load', err)
                                reject(err)
                            }
                        }
                        existing.addEventListener('load', onLoad, { once: true })
                    }
                }
            } catch (err) {
                window.__googleChartsLoaderStatus = 'error'
                reject(err)
            }
        })
        .catch((err) => {
            // Reseta para que possa tentar novamente
            loaderPromise = null;
            throw err;
        });
    }

    if (!loaderPromise) {
        throw new Error('Google Charts loader failed to initialize');
    }

    return loaderPromise;
}

export function isGoogleChartsLoaded(): boolean {
    return Boolean(window.google?.visualization && typeof window.google.visualization.DataTable === 'function');
}