---
layout: default
title:  Linear regression
---


Assume that you record a scalar input $x$ and a scalar output $y$. First, you record $x_1 = 2, y_1 = -1$, and thereafter $x_2 = 3, y_2 = 1$. Assume a linear regression model $y = \beta_0 + \beta_1x + \epsilon$ and learn the parameters with maximum likelihood $\widehat{\bbeta}$ with the assumption $\epsilon\sim\mathcal{N}(0,\sigma_\epsilon^2)$. Use the model to predict the output for the test input $x_\star = 4$, and add the model to the plot below: