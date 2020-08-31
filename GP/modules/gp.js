import { Kernel, SquaredExponentialKernel } from "./kernel.js";
import {
    create2dArray,
    getBlock,
    choleskyAdd,
    solveTriangular,
    cholesky,
    randnArray,
    choleskyDowndate,
    choleskyRemove} from "./linear-algebra.js";

/**
* Returns a matix of size [d,n], representing a grand circle on the 
* unit d-sphere in n steps starting at arandom location. Given a kernel
* matrix K, this can be turned into a tour through the sample space, simply
* by calling chol(K)' * X.
* @param {int} d 
* @param {int} n 
*/
function GPanimation(d, n) {
    if (typeof n == 'undefined' || n < 1) {
        n=10;
    };
    let x = randnArray(d);
    let r = numeric.norm2(x);
    numeric.diveq(x, r);
    let t = randnArray(d);
    numeric.addeq(t, numeric.mul(-numeric.dot(t,x),x));
    numeric.diveq(t, numeric.norm2(t));
    let s = numeric.linspace(0, 2.0 * Math.PI, n+1);
    s.shift();
    t = numeric.tensor(s, t);

    return expMap(x, t).map(x => numeric.mul(x, r));
}

/**
* Computes exponential map on a sphere.
* @param {*} mu 
* @param {*} E 
*/
function expMap(mu, E) {
    let theta = E.map(x => numeric.norm2(x));
    let q = numeric.div(numeric.sin(theta),theta);
    let Q = E.map((x,idx) => numeric.mul(q[idx],x));

    return numeric.tensor(numeric.cos(theta),mu).map((val, idx) => numeric.add(val, Q[idx]));
}  




class GaussianProcess {
    constructor(kernel) {
        if (typeof kernel == 'undefined') {
            kernel = new SquaredExponentialKernel();
        }
        this._datapointsX = [];
        this._datapointsY = [];
        this._testpoints = [];
        this._dataCholesky = [];
        this._testCovariance = [];
        this._testCholesky = [];
        this._dataTestCovariance = [];
        this._kernel = kernel;
        this._measurementNoiseVariance = 1;
        this._predictiveMean = [];
        this._predictiveVariance = [];
        this._predictiveCholesky = []
    };

    evaluateKernel(t, s) {
        return this._kernel.evaluate(t, s);
    }

    get measurementNoiseVariance() {
        return this._measurementNoiseVariance;
    }

    set measurementNoiseVariance(val) {
        this._measurementNoiseVariance = val;
        this._dataCholesky = this.evaluateKernel(this._datapointsX);
        var d_len = this._dataCholesky.length;
        for (let i=0; i < d_len; i++) {
            this._dataCholesky[i][i] += this._measurementNoiseVariance;
        }
        this._dataCholesky = cholesky(this._dataCholesky);
        this._updateMeanAndVariance();

    }

    _computePredictiveMeanAndCovariance() {
        var testCovariance = this._testCovariance;
        var L = solveTriangular(this._dataCholesky, this._dataTestCovariance);
        if (L.length > 0) {
            this._predictiveMean = numeric.dot(numeric.transpose(L),solveTriangular(this._dataCholesky, this._datapointsY));
            this._predictiveVariance = numeric.transpose(L).map((r,i)=>testCovariance[i][i]-r.reduce((acc,el)=>acc+= el*el,0));
            var predictiveCholesky = numeric.clone(this._testCholesky);
            L.forEach(l=>choleskyDowndate(predictiveCholesky, l));
            this._predictiveCholesky = predictiveCholesky;
        } else {
            this._predictiveMean = new Array(this._testpoints.length).fill(0);
            this._predictiveVariance = numeric.getDiag(this._testCovariance);
            this._predictiveCholesky = this._testCholesky;
        }
        this._predictionNeedsUpdate = false;
    }

    _updateMeanAndVariance() {
        this._predictionNeedsUpdate = true; 
    }

    get kernelParameters() {
        return this._kernel.parameterValue;
    }
    set kernelParameters(par) {
        this._kernel.parameterValue = par;
        this._dataCholesky = this.evaluateKernel(this._datapointsX);
        var d_len = this._dataCholesky.length;
        for (let i=0; i < d_len; i++) {
            this._dataCholesky[i][i] += this._measurementNoiseVariance;
        };
        this._dataCholesky = cholesky(this._dataCholesky);
        this._testCovariance = this.evaluateKernel(this._testpoints);
        this._testCholesky = cholesky(this._testCovariance);
        this._dataTestCovariance = this.evaluateKernel(this._datapointsX, this._testpoints);
        this._updateMeanAndVariance()
    }
   
    get kernel() {
        return this._kernel;
    }

    set kernel(kernel) {
        this._kernel = kernel;
        this._dataCholesky = this.evaluateKernel(this._datapointsX);
        var d_len = this._datapointsX.length;
        for (let i=0; i < d_len; i++) {
            this._dataCholesky[i][i] += this._measurementNoiseVariance;
        }

        this._dataCholesky = cholesky(this._dataCholesky);
        this._testCovariance = this.evaluateKernel(this._testpoints);
        this._testCholesky = cholesky(this._testCovariance);
        this._dataTestCovariance = this.evaluateKernel(this._datapointsX, this._testpoints)
        this._updateMeanAndVariance()
    }
    
    _addDataPointX(x) {
        this._datapointsX.push(x);
        var c = this.evaluateKernel([x], this._datapointsX)[0];
        if (this._measurementNoiseVariance < 1e-6) {
            c[c.length-1] += 1e-6;
        }
        c[c.length-1] += this._measurementNoiseVariance;
        choleskyAdd(this._dataCholesky, c);
        this._dataTestCovariance.push(this.evaluateKernel([x], this._testpoints)[0]);
    };

    _addDataPointY(y) {
        this._datapointsY.push(y);
    }

    addDataPoints(data) {
        data.forEach((d) => { this._addDataPointY(d.y); this._addDataPointX(d.x);  });
        this._updateMeanAndVariance()
    };

    _addTestPoint(x, idx) {
        if (typeof idx == 'undefined') {
            idx = this._testpoints.length;
        }
        
        // Add testpoint at specified index
        this._testpoints.splice(idx, 0, x)
        var css = this.evaluateKernel([x], (this._testpoints))[0];
        css[idx] += 1e-6; // For numerical stability
        choleskyAdd(this._testCholesky, css, idx) // Update testCholesky
        var Kss = this._testCovariance;
        Kss.splice(idx, 0, css);
        for (var i=0; i < css.length-1; i++) {
            Kss[i].splice(idx, 0, (css[i]));
        }

        // Update dataTestCovariance
        var cs = this.evaluateKernel([x], this._datapointsX)[0];
        var dataTestCovariance = this._dataTestCovariance;
        cs.forEach((d,i) => dataTestCovariance[i].splice(idx, 0, (d)));
    }

    addTestPoints(x) {
        x.forEach(d => this._addTestPoint(d.x, d.i));
        this._updateMeanAndVariance()
    }

    _removeTestPoint(idx) {
        this._testpoints.splice(idx,1);
        choleskyRemove(this._testCholesky, idx);
        this._testCovariance.splice(idx, 1)
        this._testCovariance.forEach(d=>d.splice(idx,1));
        this._dataTestCovariance.forEach(d=>d.splice(idx,1));
        this._updateMeanAndVariance();
    }

    removeTestPoints(arr) {
        var idx;
        arr.forEach((d,i)=> {
            idx = this._testpoints.findIndex(x=>d.x == x);
            if (idx > -1) {
                this._removeTestPoint(idx);
            }
        });
    }
    
    get testpoints() {
        return this._testpoints.map((d) => { return {x: d} });

    };

    get datapoints() {
        return this._datapointsX.map((d, i) => { return {x: d, y: this._datapointsY[i]} });
    };

    _removeDataPoint(idx) {
        this._datapointsX.splice(idx, 1);
        this._datapointsY.splice(idx, 1);
        choleskyRemove(this._dataCholesky, idx);
        this._dataTestCovariance.splice(idx,1)
        this._updateMeanAndVariance();
    };

    removeDatapoints(arr) {
        var idx;
        arr.forEach( (d,i)=> {
            idx = this._datapointsX.findIndex((x, i)=> d.x === x && this._datapointsY[i] == d.y);
            if (idx > -1) {
                this._removeDataPoint(idx);
            }
        });
    };

    get predictiveMean() {
        if (this._predictionNeedsUpdate) {
            this._computePredictiveMeanAndCovariance()
        }
        return numeric.clone(this._predictiveMean);
    };

    get predictiveVariance() {
        if (this._predictionNeedsUpdate) {
            this._computePredictiveMeanAndCovariance()
        }
        return numeric.clone(this._predictiveVariance);
    };
    
    get predictiveVarianceY() {
        var predVRy = this.predicitveVariance;
        predVarY.forEach((d,i)=>d[i][i] += this._measurementNoiseVariance);
        return predVarY;
    }

    get predictiveCholesky() {
        if (this._predictionNeedsUpdate) {
            this._computePredictiveMeanAndCovariance()
        }
        return numeric.clone(this._predictiveCholesky);
    };

    get predictiveCovariance() {
        if (this._predictionNeedsUpdate) {
            this._computePredictiveMeanAndCovariance()
        }
        return numeric.dot(this._predictiveCholesky, numeric.transpose(this._predictiveCholesky))
    };

    get datapointsY() {
        return this._datapointsY.map(d => d.y)
    };

    get datapointsX() {
        return this._datapointsX.map(d => d.x)
    };


    *sampler(numberOfSamples) {
        var greatCircle = (function* (numberOfPoints, gp) {
            var s = GPanimation(gp._testpoints.length, numberOfPoints),
                i = 0;
            while (true) {
                i = ++i % numberOfPoints;
                //yi = yield s[i];
                switch (yield s[i]) {
                    case "seed":
                        s = GPanimation(gp._testpoints.length, numberOfPoints);
                    case "same":
                        i += numberOfPoints-1;
                }
                // if ((yield s[i]) === "seed") {
                //     s = GPanimation(gp._testpoints.length, numberOfPoints);
                // }
            }
        })(numberOfSamples, this);

        var yieldReturnValue = "",
            nextSample = {},
            gc;

        while (true) {
            gc = greatCircle.next(yieldReturnValue).value
            if (gc.length != this._testpoints.length) {
                gc = greatCircle.next("seed").value;
            }
            nextSample.x = this._testpoints;
            nextSample.y = numeric.add(this.predictiveMean, numeric.dot(this.predictiveCholesky, gc));
            yieldReturnValue = yield nextSample;
        }
    }
}

export { GaussianProcess };
