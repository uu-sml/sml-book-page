import { create2dArray } from "./linear-algebra.js";

class Kernel {
    //constructor(name, parText, parMax, parMin, parVal, parStep, fLatex, f, parInteger) {
    constructor(name, parameterValue, parameterInfo, kernelFunction, kernelInfo) {
        this.name = name;
        this.parameterValue = parameterValue;
        this.parameterInfo = parameterInfo;
        this.kernelFunction = kernelFunction;
        this.kernelInfo = kernelInfo;
    }

    /**
     * Evaluate the kernel on all pairwise compinations of elements in t and s, i.e. cov(t,s).
     * @param {Array} t Array of length n.
     * @param {Array} s Array of length m.
     * @returns {2d Array}  Covariane matrix of size n x m.
     */
    evaluate(t, s) {
        const f = this.kernelFunction.f,
              par = this.parameterValue;
        if (typeof s !== 'undefined') {
            var t_len = t.length,
                s_len = s.length,
                cov = create2dArray(t_len, s_len);
            let cov_i;
            for (var i = 0; i < t_len; i++) {
                cov_i = cov[i];
                for (var j = 0; j < s_len; j++) {
                    cov_i[j] = f(par, t[i], s[j]);
                }
            }
            
        } else {
            var t_len = t.length,
                cov = create2dArray(t_len, t_len);
            for (var i = 0; i < t_len; i++) {
                for (var j = 0; j < i; j++) {
                    cov[i][j] = f(par, t[i], t[j]);
                    cov[j][i] = cov[i][j];
                }
                cov[i][i] = f(par, t[i], t[i]);
            }
        }
        return cov
    }
}

class SquaredExponentialKernel extends Kernel {
    constructor() {
        super(
            "Squared Exponential",
            [2, 5],
            {
                max: [4, 10],
                min: [0, 0.01],
                step: 0.01,
                latex: ["\\sigma", "\\ell"],
                html: ['\u03c3', '\u2113'],
                integer: [false, false]
            },
            {
                f: (par, t, tp) => par[0]**2 * Math.exp(- 0.5* ((t - tp)/par[1])**2),
                df: undefined
            },
            {
                html: undefined,
                latex: "\\sigma^2 e^{-\\frac{(t-s)^2}{2 \\ell^2}}"
            })
    }
};

class PolynomialKernel extends Kernel {
    constructor() {
        super(
            "Polynomial",
            [1, 0.05, 2], // parameterValue
            { //parameterInfo
                max: [4, 0.2, 11],
                min: [0, 0, 1],
                step: 0.01,
                latex: ["\\sigma_b", "\\sigma_v", "d"],
                html: ['&sigma;<sub>b</sub>', '&sigma;<sub>v</sub>', 'd'],
                integer: [false, false, true]
            },
            { // kernelFunction
                f: (par, t, tp) => (par[0]**2  + par[1]**2 * t * tp)**(par[2]-1),
                df: undefined
            },
            { // kernelInfo
                html: undefined,
                latex: "\\left(\\sigma_{b}^{2} + \\sigma_{v}^{2} t s\\right)^{d-1}"
            });
    }
}

class RationalQuadraticKernel extends Kernel {
    constructor() {
        super(
            "Rational Quadratic",
            [2, 5, 5], // parameterValue
            { //parameterInfo
                max: [4, 10, 10],
                min: [0, 0.01, 0],
                step: 0.01,
                latex: ["\\sigma", "\\ell", "\\alpha"],
                html: ['&sigma;', '&#8467', '&alpha;'],
                integer: [false, false, false]
            },
            { // kernelFunction
                f: (par, t, tp) => par[0]**2 * Math.pow(1 + 0.5 / par[2] * ((t-tp)/par[1])**2, -par[2]),
                df: undefined
            },
            { // kernelInfo
                html: undefined,
                latex: "\\sigma^2 \\left( 1 + \\frac{(t - s)^2}{2 \\alpha \\ell^2} \\right)^{-\\alpha}"
            });
    }
}

class PeriodicKernel extends Kernel {
    constructor() {
        super(
            "Periodic",
            [2, 2, 10], // parameterValue
            { //parameterInfo
                max: [4, 5, 25],
                min: [0, 0.01, 1],
                step: 0.01,
                latex: ["\\sigma", "\\ell", "p"],
                html: ['&sigma;', '&#8467', 'p'],
                integer: [false, false, false]
            },
            { // kernelFunction
                f: (par, t, tp) => par[0]**2 * Math.exp(- 2 * (Math.sin(Math.PI * Math.abs(t - tp) / par[2])/par[1])**2),
                df: undefined
            },
            { // kernelInfo
                html: undefined,
                latex: "\\sigma^2 e^{- \\frac{2 \\sin^2(\\pi |t - s|/p)}{\\ell^2}}"
            });
    }
}

class WhiteKernel extends Kernel {
    constructor() {
        super(
            "White",
            [2], // parameterValue
            { //parameterInfo
                max: [4],
                min: [0],
                step: 0.01,
                latex: ["\\sigma"],
                html: ['&sigma;'],
                integer: [false]
            },
            { // kernelFunction
                f: (par, t, tp) => Math.abs(t-tp) < 1e-10 ? par[0]**2 : 0,
                df: undefined
            },
            { // kernelInfo
                html: undefined,
                latex: "\\sigma^{2} \\delta(t, s)"
            });
    }
}

class Matern1Kernel extends Kernel {
    constructor() {
        super(
            "Matern 1",
            [2, 5], // parameterValue
            { //parameterInfo
                max: [4, 10],
                min: [0, 0.01],
                step: 0.01,
                latex: ["\\sigma", "\\ell"],
                html: ['&sigma;', '&#8467'],
                integer: [false, false]
            },
            { // kernelFunction
                f: (par, t, tp) => par[0]**2 * Math.exp(- Math.abs(t - tp) / par[1]),
                df: undefined
            },
            { // kernelInfo
                html: undefined,
                latex: "\\sigma^2 e^{-\\frac{|t-s|}{\\ell}}"
            });
    }
}

class Matern3Kernel extends Kernel {
    constructor() {
        super(
            "Matern 3",
            [2, 5], // parameterValue
            { //parameterInfo
                max: [4, 10],
                min: [0, 0.01],
                step: 0.01,
                latex: ["\\sigma", "\\ell"],
                html: ['&sigma;', '&#8467'],
                integer: [false, false]
            },
            { // kernelFunction
                f: (par, t, tp) => par[0]**2 * (1 + Math.sqrt(3)/par[1] * Math.abs(t - tp)) * Math.exp(-Math.sqrt(3) / par[1] * Math.abs(t - tp)),
                df: undefined
            },
            { // kernelInfo
                html: undefined,
                latex: "\\sigma^2\\left( 1 + \\frac{\\sqrt{3}|t - s|}{\\ell}  \\right)e^{-\\frac{\\sqrt{3}|t - s|}{\\ell}}"
            });
    }
}

class Matern5Kernel extends Kernel {
    constructor() {
        super(
            "Matern 5",
            [2, 5], // parameterValue
            { //parameterInfo
                max: [4, 10],
                min: [0, 0.01],
                step: 0.01,
                latex: ["\\sigma", "\\ell"],
                html: ['&sigma;', '&#8467'],
                integer: [false, false]
            },
            { // kernelFunction
                f: (par, t, tp) => {
                let r = Math.abs(t - tp);
                return par[0]**2 * (1 + Math.sqrt(5) * r/par[1] + 5 * r**2 /3.0 / par[1]**2) * Math.exp(-Math.sqrt(5) * r / par[1])},
                df: undefined
            },
            { // kernelInfo
                html: undefined,
                latex: "\\sigma^2 \\left( 1 + \\frac{\\sqrt{5} |t - s|}{\\ell} + \\frac{5(t-s)^2}{3 \\ell^2}\\right) e^{-\\frac{\\sqrt{5}|t - s|}{\\ell}}"
            });
    }
}

class GammaExponentialKernel extends Kernel {
    constructor() {
        super(
            "\u03b3-Exponential",
            [2, 5, 1], // parameterValue
            { //parameterInfo
                max: [4, 10, 2],
                min: [0, 0, 0],
                step: 0.01,
                latex: ["\\sigma", "\\ell", "\\gamma"],
                html: ['&sigma;', '&#8467', '&gamma;'],
                integer: [false, false, false]
            },
            { // kernelFunction
                f: (par, t, tp) => par[0]**2 * Math.exp(- Math.pow(Math.abs(t - tp)/par[1], par[2])),
                df: undefined
            },
            { // kernelInfo
                html: undefined,
                latex: "\\sigma^2 e^{-\\left( \\frac{|t - s|}{\\ell} \\right)^\\gamma}"
            });  
    }
}

class NeuralNetworkKernel extends Kernel {
    constructor() {
        super(
            "Neural Network",
            [1.5, 1.5], // parameterValue
            { //parameterInfo
                max: [3, 3],
                min: [0, 0],
                step: 0.01,
                latex: ["\\sigma_0", "\\sigma"],
                html: ['&sigma;', '&#8467', '&gamma;'],
                integer: [false, false, false]
            },
            { // kernelFunction
                f: (par, t, tp) => 2/Math.PI * Math.asin((2*par[0]**2 + 2*t*tp*par[1]**2) / Math.sqrt((1 + 2*par[0]**2 + 2*t*t*par[1]**2) * (1 + 2*par[0]**2 + 2*tp*tp*par[1]**2))),
                df: undefined
            },
            { // kernelInfo
                html: undefined,
                latex: "\\frac{2}{\\pi} \\sin^{-1} \\left( \\frac{2\\sigma_{0}^{2} + 2 \\sigma^2 t s}{\\sqrt{(1 + 2 \\sigma_{0}^2 + 2 \\sigma^2 t^2)(1 + 2 \\sigma_{0}^2  + 2 \\sigma^2 s^2)}} \\right)"
            });
    }
}

export {
    Kernel,
    SquaredExponentialKernel,
    PolynomialKernel,
    RationalQuadraticKernel,
    PeriodicKernel,
    WhiteKernel,
    Matern1Kernel,
    Matern3Kernel,
    Matern5Kernel,
    GammaExponentialKernel,
    NeuralNetworkKernel
};