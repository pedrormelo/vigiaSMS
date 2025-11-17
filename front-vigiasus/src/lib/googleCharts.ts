// Shared Google Charts loader utility
// Ensures the loader script is injected once and returns a promise that resolves
// when google.charts is ready to use.

let loaderPromise: Promise<any> | null = null;

export function loadGoogleCharts(packages: string[] = ['corechart', 'bar']): Promise<any> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Google Charts can only be loaded in the browser'));
    }

    // If google.visualization already exists AND the core packages seem loaded, resolve immediately.
    // (Esta verificação é otimista, mas agora verifica PieChart)
    if ((window as any).google && (window as any).google.visualization && (window as any).google.visualization.PieChart) {
        return Promise.resolve((window as any).google);
    }

    if (loaderPromise) return loaderPromise;

    loaderPromise = new Promise((resolve, reject) => {
            try {
                const existing = document.querySelector('script[data-google-charts-loader]');
                const debug = (...args: any[]) => {
                    if (typeof console !== 'undefined' && (console.debug || console.log)) {
                        (console.debug || console.log)('[googleCharts]', ...args)
                    }
                }

                const finishWhenVisualizationReady = () => {
                    // Poll until google.visualization AND DataTable constructor are available
                    const start = Date.now();
                    const timeoutMs = 12000;
                    const interval = setInterval(() => {
                        const g = (window as any).google;
                        if (g && g.visualization && typeof g.visualization.DataTable === 'function') {
                            clearInterval(interval);
                            debug('google.visualization.DataTable ready (polled)');
                            (window as any).__googleChartsLoaderStatus = 'ready';
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
                            (window as any).google.charts.load('current', { packages })

                            const timeoutMs = 12000
                            let timeoutId: number | undefined

                            const clear = () => {
                                if (timeoutId) {
                                    clearTimeout(timeoutId)
                                    timeoutId = undefined
                                }
                            }

                            ;(window as any).google.charts.setOnLoadCallback(() => {
                                clear()
                                debug('google.charts.setOnLoadCallback fired')
                                ;(window as any).__googleChartsLoaderStatus = 'ready'
                                resolve((window as any).google)
                            })

                            timeoutId = window.setTimeout(() => {
                                debug('timeout waiting google.charts.setOnLoadCallback')
                                ;(window as any).__googleChartsLoaderStatus = 'timeout'
                                reject(new Error('Timed out loading Google Charts'))
                            }, timeoutMs)

                            // Also start polling as a fallback in case setOnLoadCallback never fires
                            finishWhenVisualizationReady()
                        } catch (err) {
                            debug('error during onload handling', err)
                            ;(window as any).__googleChartsLoaderStatus = 'error'
                            reject(err)
                        }
                    }
                    script.onerror = () => {
                        debug('loader script error')
                        ;(window as any).__googleChartsLoaderStatus = 'error'
                        reject(new Error('Failed to load Google Charts script'))
                    }
                    document.head.appendChild(script)
                } else {
                    debug('loader script already present')
                    // Se o script já existe, a lógica de fallback (com polling) é aceitável
                    if ((window as any).google && (window as any).google.visualization && typeof (window as any).google.visualization.DataTable === 'function') {
                        debug('google.visualization.DataTable already available')
                        resolve((window as any).google)
                    } else if ((window as any).google && (window as any).google.charts) {
                        debug('google.charts present, calling load')
                        try {
                            ;(window as any).google.charts.load('current', { packages })
                            ;(window as any).google.charts.setOnLoadCallback(() => {
                                debug('google.charts.setOnLoadCallback fired (existing script)')
                                ;(window as any).__googleChartsLoaderStatus = 'ready'
                                resolve((window as any).google)
                            })
                            // O polling aqui é OK como fallback caso o callback falhe
                            finishWhenVisualizationReady() 
                        } catch (err) {
                                    debug('error while calling google.charts.load', err)
                                    ;(window as any).__googleChartsLoaderStatus = 'error'
                                    reject(err)
                        }
                    } else {
                        debug('waiting for existing script load event')
                        const onLoad = () => {
                            try {
                                ;(window as any).google.charts.load('current', { packages })
                                ;(window as any).google.charts.setOnLoadCallback(() => {
                                    debug('google.charts.setOnLoadCallback fired (after existing load)')
                                    resolve((window as any).google)
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
                ;(window as any).__googleChartsLoaderStatus = 'error'
                reject(err)
            }
        })
        .catch((err) => {
            // Reseta para que possa tentar novamente
            loaderPromise = null;
            throw err;
        });

    return loaderPromise;
}

export function isGoogleChartsLoaded(): boolean {
    return !!((window as any).google && (window as any).google.visualization && typeof (window as any).google.visualization.DataTable === 'function');
}