/**
 * Returns an empty 2d Array.
 * @param {int rows 
* @param {int} cols 
*/
function create2dArray(rows, cols) {
    return [...Array(rows).keys()].map(i => Array(cols));
}

function createRandom2dArray(rows, cols) {
    return [...Array(rows).keys()].map(i => randnArray(cols));
}

/**
* Create an Array of length size with normal distributed values.
*/
var randnArray = (function () {
    const randn = d3.randomNormal();
    return function (size) {
        let zs = new Array(size);
        for (let i = 0; i < size; i++) {
            zs[i] = randn();
        }
        return zs;
    }})()
   
function getBlock(A, from, to) {
    return numeric.any(numeric.gt(from, to))
        ? numeric.rep([0,0], 0)
        : numeric.getBlock(A, from, to)
}

/**
* Compute Cholesky factorization of A such that LL'=A. L is a lower
* triangular matrix with zeros above the diagonal.
* @param {2d array} A Positive definite, d x d matrix.
* @returns {2d array} Cholesky factor L such that C=L*L.T.
*/
function cholesky(A, tol = 1e-9) {
    let n = A.length,
        L = numeric.rep([n,n], 0),
        i, j, k;

    for (i = 0; i < n; i++) {
        for (j = 0; j < (i+1); j++) {
            let s = 0;
            for (k = 0; k < j; k++) {
                s += L[i][k] * L[j][k];
            }
            L[i][j] = (i === j) ? Math.sqrt(A[i][i] + tol - s) : (1.0 / L[j][j] * (A[i][j] - s));
        }
    }
    return L;
}

/**
* Use solveTriangular to solve a trianglurar system Lx=b where L
* is a lower or upper triangular d x d matrix. Array b can be 
* either 2d or 1d. For a 2d d x k matrix, solveTriangular solves 
* Lx=b for each column in b.
* @param {2d Array} L Lower or upper triangular d x d matrix.
* @param {Array} b Array of length d
* @param {string} mode "upper" or "lower"
*/
function solveTriangular(L, b, mode = "lower") {
    let b_dims =numeric.dim(b),
        b_rows = b_dims[0],
        b_cols = b_dims[1],
        L_dims = numeric.dim(L),
        L_rows = L_dims[0],
        L_cols = L_dims[1],
        x = numeric.clone(b);
    if (mode === "lower") {
        for (let i = 0; i < L_rows; i++) {
            let Li = L[i],
                xi = x[i];
            for (let j = 0; j < i; j++) {
                let xj = x[j];
                if (typeof b_cols !== 'undefined') {
                    for (let k=0; k < b_cols; k++) {
                        xi[k] -= xj[k]*Li[j];
                    }
                } else {
                    x[i] -= xj*Li[j];
                }                
            }
            if (typeof b_cols !== 'undefined') {
                for (let k = 0; k < b_cols; k++) {
                    xi[k] /= Li[i];
                }
            } else {
                x[i] /= Li[i];
            }
        }
    } else {
        for (let i = L_rows-1; i >= 0; i--) {
            let Li = L[i],
                xi = x[i];
            for (let j = L_cols-1; j > i; j--) {
                let xj = x[j];
                if (typeof b_cols !== 'undefined') {
                    for (let k=0; k < b_cols; k++) {
                        xi[k] -= xj[k]*Li[j];
                    }
                } else {
                    x[i] -= xj*Li[j];
                }                
            }
            if (typeof b_cols !== 'undefined') {
                for (let k=0; k<b_cols; k++) {
                    xi[k] /= Li[i];
                }
            } else {
                x[i] /= Li[i];
            }
        }
    }
    return x
}

/**
* Compute sqrt(x*x-y*y) in a numerically stable way.
* @param {number} x 
* @param {number} y 
*/
function rypot(x, y) {
    let t;
    x = Math.abs(x);
    y = Math.abs(y);
    t = x < y ? x : y;
    x = x > y ? x : y;
    t /= x
    return x*Math.sqrt(1-t*t)
}

/**
* Compute sqrt(x**2+y**2) in a numerically sound way
* @param {number} x 
* @param {number} y 
*/
function hypot(x, y) {
    let t;
    x = Math.abs(x);
    y = Math.abs(y);
    t = x < y ? x : y;
    x = x > y ? x : y;
    t /= x
    return x*Math.sqrt(1+t*t)
}

/**
* Update the lower  triangular Cholesky factor `L` with the rank 1 addition
* implied by `x` such that:
*    L_L_' = LL' + xx'
* where L_ is the lower triangular Cholesky factor L after updating.  Note
* that both x and L are **modified in place**.
* @param {*} L Cholesky factor. Square d x d, lower triangular matrix.
* @param {*} x Array of length d.
* @param {number} f Update only from row and column `f`.
*/
function choleskyUpdate(L, x, f = 0) {
    let n = x.length;
    for (let k=0; k < n; k++) {
        let r = hypot(L[f+k][f+k], x[k]);
        let c = r / L[f+k][f+k];
        let s = x[k] / L[f+k][f+k];
        L[f+k][f+k] = r;
        for (let i=k+1; i < n; i++) {
            L[f+i][f+k] = (L[f+i][f+k] + s*x[i])/c;
            x[i] = c*x[i] - s*L[f+i][f+k];
        }
    }
}

/**
* Update the lower  triangular Cholesky factor `L` with the rank 1 subtraction
* implied by `x` such that:
*    L_L_' = LL' - xx'
* where L_ is the lower triangular Cholesky factor L after updating.  Note
* that both x and L are modified **in place**.
* @param {*} L Cholesky factor. Square d x d, lower triangular matrix.
* @param {*} x Array of length d.
* @param {Number} f Update only from row and column `f`.
*/
function choleskyDowndate(L, x, f = 0) {
    let n = x.length;
    for (let k=0; k < n; k++) {
        let r = rypot(L[f+k][f+k], x[k]);
        let c = r / L[f+k][f+k];
        let s = x[k] / L[f+k][f+k];
        L[f+k][f+k] = r;
        for (let i=k+1; i < n; i++) {
            L[f+i][f+k] = (L[f+i][f+k] - s*x[i])/c;
            x[i] = c*x[i] - s*L[f+i][f+k];
        }
    }
}

/**
 * Add a zero column and row at columns col and row row.
 * @param {2d Array} a 
 * @param {number} row 
 * @param {number} col 
 */
function extend2dArray(a, row, col) {
    if (a.length == 0) { 
        a.push([0])
    } else {
        var dim = numeric.dim(a);
        if (typeof row == 'undefined') {
            row  = dim[0];

        }
        if (typeof col == 'undefined') {
            col = row;
        }
        a.splice(row, 0, new Array(dim[1]).fill(0));
        a.forEach(d => d.splice(col, 0, 0))
    }
}

/**
 * Remove row row and column col from 2d array a.
 * @param {array} a 
 * @param {number} row 
 * @param {number} col 
 */
function reduce2dArray(a, row, col) {
    var dim = numeric.dim(a);
    if (typeof row == 'undefined') {
        row  = dim[0]-1;

    }
    if (typeof col == 'undefined') {
        col = dim[1]-1;
    }
    a.splice(row, 1,);
    a.forEach(d=>d.splice(col, 1,));
}

/**
 * Update the Cholesky factor L*L.T = C when row and column r of C
 * is replaced by x.
 * @param {2d Array} L Choelsky factor. Square d x d matrix.
 * @param {Array} x Array of length d to replace row and column r in C.
 * @param {number} r Row and column to replace.
 */
function choleskyReplace(L, x, r) {
    var dim = numeric.dim(L);
    if (typeof r == 'undefined') {
        r = dim[0]-1;
    }
    let Lr = L[r],
        sos = 0;
    solveTriangular(getBlock(L, [0,0], [r-1,r-1]), x.slice(0,r)).forEach((d, i) => {Lr[i]=d; sos +=d*d})
    Lr[r] = x[r] - sos > 0 ? Math.sqrt(x[r] - sos) : 1e-10 ;
    if (r < dim[0]-1) {
        choleskyUpdate(L, numeric.transpose(getBlock(L, [r+1, r], [dim[0]-1, r]))[0], r+1)

        numeric.div(
            numeric.sub(
                x.slice(r+1,dim[0]),
                (r > 0) ? numeric.dot(getBlock(L, [r+1,0], [dim[0]-1,r-1]),L[r].slice(0,r)) : 0
                ),
            L[r][r]
        ).forEach((d,i) => L[r+i+1][r] = d);

        choleskyDowndate(L, numeric.transpose(getBlock(L, [r+1, r], [dim[0]-1, r]))[0], r+1)
    }
}

/**
 * Update Cholesky factor when inserting array x at new row and column at r in C = L*L.T.
 * @param {2d Array} L Cholesky factor. Square d x d matirx.
 * @param {Array} x Array of length d+1.
 * @param {Number} r Where to insert new row and column x.
 */
function choleskyAdd(L, x, r) {
    if (typeof r == 'undefined') {
        r = L.length
    }
    extend2dArray(L, r);
    choleskyReplace(L, x, r);
}
/**
 * Update Cholesky factor when removing row and column r from C = L*L.T.
 * @param {2d Array} L Cholesky factor. Square d x d matirx.
 * @param {Number} r Row and column to remove.
 */
function choleskyRemove(L, r) {
    let dim = numeric.dim(L);
    if (typeof r == 'undefined') {
        r = dim[0]-1;
    }
    let q = new Array(dim[0]-r-1);
    for (let i=0; i < dim[0]-r-1; i++) {
        q[i] = L[r+1+i][r];
    }
    // numertic.transpose(getBlock(L, [r+1, r], [dim[0]-1, r]))[0]
    choleskyUpdate(L, q, r+1);
    reduce2dArray(L, r, r);
}

 /**
 * Check if all elements in A are close to corresponing element in B.
 * That is, check if |A[i][j] - B[i][j]| < tol if A and B are 2d arrays.
 * @param {*} A 
 * @param {*} B 
 * @param {*} tol 
 */
function allClose(A, B, tol = 1e-6) {
    return numeric.all(numeric.lt(numeric.abs(numeric.sub(A, B)), tol))
};

function meanSquareError(A, B) {
    let dim = numeric.dim(A);
    return numeric.sum(numeric.pow(numeric.sub(A,B), 2)) / dim.reduce((ac, c)=>ac*c)
}

function maxAbsoluteError(A, B) {
    return numeric.abs(numeric.sub(A,B)).reduce((s,c)=> Math.max(s, c.reduce((s,c)=>Math.max(s, c), 0)), 0)
}

function testIfAny(f, A) {
    return A.reduce((accum, el)=> accum || el.reduce((accus, el) => accum || f(el), false), false);
}

export {
    create2dArray,
    createRandom2dArray,
    randnArray,
    getBlock,
    cholesky,
    solveTriangular,
    choleskyUpdate,
    choleskyDowndate,
    choleskyReplace,
    choleskyAdd,
    choleskyRemove,
    extend2dArray,
    reduce2dArray,
    allClose,
    meanSquareError,
    maxAbsoluteError,
    testIfAny
}