// Shared Google Charts loader utility
// Ensures the loader script is injected once and returns a promise that resolves
// when google.charts is ready to use.

let loaderPromise: Promise<any> | null = null;

export function loadGoogleCharts(packages: string[] = ['corechart', 'bar']): Promise<any> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Google Charts can only be loaded in the browser'));
    }

    // If google.visualization already exists, resolve immediately
    if ((window as any).google && (window as any).google.visualization) {
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
                    // poll until google.visualization is available
                    const start = Date.now()
                    const timeoutMs = 10000
                    const interval = setInterval(() => {
                        if ((window as any).google && (window as any).google.visualization) {
                            clearInterval(interval)
                            debug('google.visualization ready (polled)')
                            ;(window as any).__googleChartsLoaderStatus = 'ready'
                            resolve((window as any).google)
                            return
                        }
                        if (Date.now() - start > timeoutMs) {
                            clearInterval(interval)
                            reject(new Error('Timed out waiting for google.visualization'))
                            return
                        }
                    }, 100)
                }

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
                            ;(window as any).google.charts.setOnLoadCallback(() => {
                                debug('google.charts.setOnLoadCallback fired')
                                ;(window as any).__googleChartsLoaderStatus = 'ready'
                                resolve((window as any).google)
                            })
                            // also use polling fallback
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
                    // If google is already present and visualization available, resolve
                    if ((window as any).google && (window as any).google.visualization) {
                        debug('google.visualization already available')
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
                            finishWhenVisualizationReady()
                        } catch (err) {
                                    debug('error while calling google.charts.load', err)
                                    ;(window as any).__googleChartsLoaderStatus = 'error'
                                    reject(err)
                        }
                    } else {
                        // script present but google not yet attached; wait for the script load event
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
            // Reset so callers can retry later
            loaderPromise = null;
            throw err;
        });

    return loaderPromise;
}

export function isGoogleChartsLoaded(): boolean {
    return !!((window as any).google && (window as any).google.visualization);
}
