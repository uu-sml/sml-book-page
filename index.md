---
layout: default
title: Machine Learning - A First Course for Engineers and Scientists
tagline: Andreas Lindholm, Niklas Wahlström, Fredrik Lindsten and Thomas B. Schön
description: An upcoming textbook on machine learning 
---

When we developed the course [Statistical Machine Learning](http://www.it.uu.se/edu/course/homepage/sml/) for engineering students at Uppsala University, we found no appropriate textbook, so we ended up writing our own. It will be published by [Cambridge University Press](https://www.cambridge.org/) in 2021.

Andreas Lindholm,
[Niklas Wahlström](https://www.it.uu.se/katalog/nikwa778/),
[Fredrik Lindsten](https://liu.se/medarbetare/freli29), and
[Thomas B. Schön](http://user.it.uu.se/~thosc112/) 

A draft of the book is available below. **We will keep a PDF of the book freely available also after its publication.**


[**Latest draft of the book**](book/sml-book-draft-latest.pdf) ([older versions &gt;&gt;](https://github.com/uu-sml/sml-book-page/commits/master/book))

## Table of Contents

1. **Introduction**
   - The machine learning problem
   - Machine learning concepts via examples
   - About this book   
2. **Supervised machine learning: a first approach**
   - Supervised machine learning
   - A distance-based method: k-NN
   - A rule-based method: Decision trees
3. **Basic parametric models for regression and classification**
   - Linear regression
   - Classification and logistic regression
   - Polynomial regression and regularization
   - Generalized linear models
4. **Understanding, evaluating and improving the performance**
   - Expected new data error: performance in production
   - Estimating the expected new data error
   - The training error–generalization gap decomposition
   - The bias-variance decomposition
   - Additional tools for evaluating binary classifiers
5. **Learning parametric models**
   - Principles pf parametric modelling
   - Loss functions and likelihood-based models
   - Regularization   
   - Parameter optimization
   - Optimization with large datasets
   - Hyperparameter optimization
6. **Neural networks and deep learning**
   - The neural network model
   - Training a neural network   
   - Convolutional neural networks
   - Dropout
7. **Ensemble methods: Bagging and boosting**
   - Bagging
   - Random forests
   - Boosting and AdaBoost
   - Gradient boosting
8. **Nonlinear input transformations and kernels**
   - Creating features by nonlinear input transformations
   - Kernel ridge regdression
   - Support vector regression
   - Kernel theory
   - Support vector classification
9. **The Bayesian approach and Gaussian processes** 
   - The Bayesian idea
   - Bayesian linear regression
   - The Gaussian process [**Online material: Gaussian process visualization**](GP/index.html)
   - Practial aspects of the Gaussian process
   - Other Bayesian methods in machine learning
10. **Generative models and learning from unlabeled data**
    - The Gaussian mixture model and discriminant analysis
    - Cluster analysis
    - Deep generative models
    - Representation learning and dimensionality reduction
11. **User aspects of machine learning**
    - Defining the machine learning problem
    - Improving a machine learning model
    - What if we cannot collect more data?
    - Practical data issues
    - Can I trust my machine learning model?
12. **Ethics in machine learning** (by [David Sumpter](https://katalog.uu.se/empinfo/?id=N7-525))
    - Fairness and error functions
    - Misleading claims about performance
    - Limitations of training data


**If you want to cite the book,** you can cite it as

{% highlight tex %}
@book{smlbook,
   author = {Lindholm, Andreas and Wahlstr\"om, Niklas and Lindsten, Fredrik and Sch\"on, Thomas B.},
   year = 2021,
   title = {Machine Learning - A First Course for Engineers and Scientists},
   URL={https://smlbook.org},
}
{% endhighlight %}

## Exercise material

Will eventually be added to this page. Meanwhile you may have a look at the material for our [course at Uppsala University](http://www.it.uu.se/edu/course/homepage/sml/).

## [Report mistakes and give feedback](https://github.com/uu-sml/sml-book-page/issues)
(A free GitHub account is required)
