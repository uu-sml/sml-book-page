---
layout: problem
title: Linear regression
---

### a
Assume that you record a scalar input $x$ and a scalar output $y$. First, you record $x_1 = 2, y_1 = -1$, and thereafter $x_2 = 3, y_2 = 1$. Assume a linear regression model $y = \theta_0 + \theta_1x + \epsilon$ and learn the parameters with maximum likelihood $\widehat{\bf\theta}$ with the assumption $\epsilon\sim\mathcal{N}(0,\sigma_\epsilon^2)$. Use the model to predict the output for the test input $x_\star = 4$, and add the model to the plot below:

### b
Now, assume you have made a third observation $y_3 = 2$ for $x_3 = 4$ (is that what you predicted in (a)?). Update the parameters $\widehat{\bf\theta}$ to all 3 data samples, add the new model to the plot (together with the new data point) and find the prediction for $x_\star = 5$.
				
### c				
Repeat (b), but this time using a model without intercept term, i.e., $y = \theta_1x + \epsilon$.

### d
Repeat (b), but this time using Ridge Regression with $\gamma=1$ instead.

### e
You realize that there are actually \emph{two} output variables in the problem you are studying. In total, you have made the following observations:

| sample| input $x$| first output $y_1$ | second output $y_2$ |
|-|-|-|-|
|(1)|2|-1|0|
|(2)|3|1|2|
|(3)|4|2|-1|

You want to model this as a linear regression with multidimensional outputs (without regularization), i.e.,
$$\begin{align}
y_1 &= \theta_{01}+\theta_{11}x + \epsilon\\
y_2 &= \theta_{02}+\theta_{12}x + \epsilon
\end{align}$$
By introducing, for the general case of $p$ inputs and $q$ outputs, the matrices
$$\begin{align}
\underbrace{\begin{bmatrix}
y_{11} & \cdots & y_{1q} \\
y_{21} & \cdots & y_{2q} \\
\vdots & & \vdots \\
y_{n1} & \cdots & y_{nq}
\end{bmatrix}}_{\bf Y} =
\underbrace{\begin{bmatrix}
1 & x_{11} & x_{12} & \cdots & x_{1p} \\
1 & x_{21} & x_{22} & \cdots & x_{2p} \\
\vdots & \vdots & \vdots & & \vdots \\
1 & x_{n1} & x_{n2} & \cdots & x_{np} \\
\end{bmatrix}}_{\bf X}
\underbrace{\begin{bmatrix}
\theta_{01} & \theta_{02} & \cdots & \theta_{0q} \\
\theta_{11} & \theta_{12} & \cdots & \theta_{1q} \\
\theta_{21} & \theta_{22} & \cdots & \theta_{2q} \\
\vdots & \vdots & & \vdots \\
\theta_{p1} & \theta_{p2} & \cdots & \theta_{pq} \\
\end{bmatrix}}_{\bf B} +\epsilon,\end{align}$$
try to make an educated guess how the normal equations can be generalized to the multidemsional output case. (A more thorough derivation is found in problem 1.5). Use your findings to compute the least square solution $\widehat{\bf B}$ to the problem now including both the first output $y_1$ and the second output $y_2$.
