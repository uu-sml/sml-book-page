---
layout: problem
title: Linear regression
---

$
   \def\B{{\bf B}}
$

<ol type="A"><li>
Assume that you record a scalar input $x$ and a scalar output $y$. First, you record $x_1 = 2, y_1 = -1$, and thereafter $x_2 = 3, y_2 = 1$. Assume a linear regression model $y = \beta_0 + \beta_1x + \epsilon$ and learn the parameters with maximum likelihood $\widehat{\theta}$ with the assumption $\epsilon\sim\mathcal{N}(0,\sigma_\epsilon^2)$. Use the model to predict the output for the test input $x_\star = 4$, and add the model to the plot below:</li>


<li>Now, assume you have made a third observation $y_3 = 2$ for $x_3 = 4$ (is that what you predicted in (a)?). Update the parameters $\widehat{\bbeta}$ to all 3 data samples, add the new model to the plot (together with the new data point) and find the prediction for $x_\star = 5$.
				
<li>Repeat (b), but this time using a model without intercept term, i.e., $y = \beta_1x + \epsilon$.</li>

<li>Repeat (b), but this time using Ridge Regression with $\gamma=1$ instead.</li>

<li> You realize that there are actually \emph{two} output variables in the problem you are studying. In total, you have made the following observations:

\begin{tabular}{ c c c c }
  sample & input $x$ & first output $y_1$ & second output $y_2$ \\ \hline
  (1) & 2 & -1 & 0 \\
  (2) & 3 & 1 & 2  \\
  (3) & 4 & 2 & -1 \\
\end{tabular}

You want to model this as a linear regression with multidimensional outputs (without regularization), i.e.,
\begin{align}
y_1 &= \beta_{01}+\beta_{11}x + \epsilon\\
y_2 &= \beta_{02}+\beta_{12}x + \epsilon
\end{align}
By introducing, for the general case of $p$ inputs and $q$ outputs, the matrices
\begin{align}
\underbrace{\begin{bmatrix}
y_{11} & \cdots & y_{1q} \\
y_{21} & \cdots & y_{2q} \\
\vdots & & \vdots \\
y_{n1} & \cdots & y_{nq}
\end{bmatrix}}_{\Y}
=
\underbrace{\begin{bmatrix}
1 & x_{11} & x_{12} & \cdots & x_{1p} \\
1 & x_{21} & x_{22} & \cdots & x_{2p} \\
\vdots & \vdots & \vdots & & \vdots \\
1 & x_{n1} & x_{n2} & \cdots & x_{np} \\
\end{bmatrix}}_{\X}
\underbrace{\begin{bmatrix}
\beta_{01} & \beta_{02} & \cdots & \beta_{0q} \\
\beta_{11} & \beta_{12} & \cdots & \beta_{1q} \\
\beta_{21} & \beta_{22} & \cdots & \beta_{2q} \\
\vdots & \vdots & & \vdots \\
\beta_{p1} & \beta_{p2} & \cdots & \beta_{pq} \\
\end{bmatrix}}_{\B}
+ \epsilon,
\end{align}
try to make an educated guess how the normal equations can be generalized to the multidemsional output case. (A more thorough derivation is found in problem 1.5). Use your findings to compute the least square solution $\widehat{\B}$ to the problem now including both the first output $y_1$ and the second output $y_2$.</li>
