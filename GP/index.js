import {   
    SquaredExponentialKernel,
    PolynomialKernel,
    RationalQuadraticKernel,
    PeriodicKernel,
    WhiteKernel,
    Matern1Kernel,
    Matern3Kernel,
    Matern5Kernel,
    GammaExponentialKernel,
    NeuralNetworkKernel}
    from "./modules/kernel.js";

import { GaussianProcess } from "./modules/gp.js";

function* lineSampler(sampler, elem, idx) {
    // var myColor = d3.scaleLinear().domain([0,10])
    //     .range(["gold", "blue", "green", "yellow", "black", "grey", "darkgreen", "pink", "brown", "slateblue", "grey1", "orange"]);

    // var myColor = d3.scaleLinear().domain([0,2])
    //     .range(["#963D5A", "#4C191B"])
    //     .interpolator(d3.interpolateHcl);
    var data = sampler.next();
    var yieldReturnValue ;
    if (!data.done) {
        var line = elem.append("path")
            .attr("class", "sampleLine")
            .attr("d", valueline(d3.zip(data.value.x, data.value.y)));
        // if (typeof idx !== 'undefined') {
        //     line.style("stroke", myColor(idx));
        // }
        
        while (!data.done) {
            yieldReturnValue = yield;
            if (yieldReturnValue == "remove") {
                line.remove();
                return;
            } else {
                data = sampler.next(yieldReturnValue);
                line.transition()
                    .duration(200)
                    .ease(d3.easeLinear)
                    .attr("d", valueline(d3.zip(data.value.x, data.value.y)))
            }
        }
    }
    return;
}

var kernels = [
    new SquaredExponentialKernel(),
    new PolynomialKernel(),
    new RationalQuadraticKernel(),
    new Matern1Kernel(),
    new Matern3Kernel(),
    new Matern5Kernel(),
    new GammaExponentialKernel(),
    //new NeuralNetworkKernel(),
    new PeriodicKernel(),
    new WhiteKernel(),
]


const margin = {top: 40, right: 20, bottom: 200, left: 40},
    plotAreaWidth = 960 - margin.left - margin.right,
    plotAreaHeight = 600 - margin.top - margin.bottom;

var paused = false;
const pointRadius = 6;
var numberOfSamplers = 3;

const GP = new GaussianProcess();


GP._measurementNoiseVariance = 0.1;
const Xs = numeric.linspace(-25, 25, 200);
GP.addTestPoints(Xs.map((d)=>{return {x: d}}))

// Get container to plot in
const container = d3.select("#gp-viz");
    

const svg = container.append("div")
    .attr("class", "svg-container")
    .append("svg")
    .attr("id", "gpChart")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", [0, 0, plotAreaWidth+margin.right+margin.left, plotAreaHeight+margin.top+margin.bottom])
    .attr("class", "svg-content-responsive");

svg.append("clipPath")
    .attr("id", "clipPath")
    .attr("clipPathUnits", "userSpaceOnUse")
    .append("rect")
    .attr("x", -margin.left)
    .attr("y", -10)
    .attr("width", plotAreaWidth+margin.left)
    .attr("height", plotAreaHeight+35);


let drag = (function () {
    function dragstarted(d) {
        d3.select(this).raise().attr("style", "stroke: black; stroke-width: 1px; opacity: 0.5").attr("r", pointRadius*2);
        let data = d3.select(this).datum();
        GP.removeDatapoints([{x: xScale.invert(data.x), y: yScale.invert(data.y)}])
        updateAnimation()
    }

    function dragged(d) {
        let coords = d3.mouse(this)
        d3.select(this).attr("cx", d.x = coords[0]).attr("cy", d.y = coords[1]);
    }

    function dragended(d) {
        var dot = d3.select(this);
        var data = dot.datum();
        var domainX = xScale.domain();
        var domainY = yScale.domain();

        if (xScale.invert(data.x) < domainX[0] 
            || xScale.invert(data.x) > domainX[1]
            || yScale.invert(data.y) < domainY[0] 
            || yScale.invert(data.y) > domainY[1]) {
            dot.remove()
        } else {
            dot.attr("style", "stoke: null;").attr("r", pointRadius);
            GP.addDataPoints([{x: xScale.invert(data.x), y: yScale.invert(data.y)}]);
            updateAnimation()
        }
    }

    return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
    })()

var xScale = d3.scaleLinear().range([0, plotAreaWidth]).domain(d3.extent(Xs));
var yScale = d3.scaleLinear().range([plotAreaHeight, 0]).domain([-8, 8]);

const plotGroup = svg.append("g")
    .attr("class", "plotGroup")
    .attr("transform", `translate(${margin.left},${margin.top})`);

plotGroup.attr("clip-path", "url(#clipPath)");

const controlsGroup = svg.append("g")
    .attr("class", "controlsGroup")
    .attr("transform", `translate(${margin.left+plotAreaWidth},${margin.top-24}) scale(1.5)`);
const titleGroup = svg.append("g")
    .attr("class", "titleGroup")
    .attr("transform", `translate(${margin.left}, ${margin.top-24}) scale(1)`);

const lineSamplers = [...new Array(numberOfSamplers)].map((d, i)=>lineSampler(GP.sampler(15), plotGroup, i));

svg.on("click", function () {
    let coords = d3.mouse(this);
    coords[0] -= margin.left;
    coords[1] -= margin.top;
    var domainX = xScale.domain();
    var domainY = yScale.domain();

    if (xScale.invert(coords[0]) > domainX[0] 
            && xScale.invert(coords[0]) < domainX[1]
            && yScale.invert(coords[1]) > domainY[0] 
            && yScale.invert(coords[1]) < domainY[1]) {
        plotGroup.append("circle")
            .datum({x: coords[0], y: coords[1]})
            .attr("class", "datapoint")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", pointRadius)
            .call(drag)
            .on("dblclick", function() {
                let data = d3.select(this).datum();
                GP.removeDatapoints([{x: xScale.invert(data.x), y: yScale.invert(data.y)}]);
                d3.select(this).remove();
                updateAnimation()
            })
            .on("click", function () {
                var element = d3.select(this);
                var data = element.datum();
                GP.removeDatapoints([{x: xScale.invert(data.x), y: yScale.invert(data.y)}]);
                updateAnimation();
                element.remove();
                d3.event.stopPropagation()
            });
        GP.addDataPoints([{x: xScale.invert(coords[0]), y: yScale.invert(coords[1])}])
        updateAnimation()
        }
    })

var pauseG = controlsGroup.append("g")
    .attr("transform", `scale(1) translate(-120,0)`);
var reloadG = controlsGroup.append("g")
    .attr("transform", `scale(1) translate(-96,0)`);;
var shuffleG = controlsGroup.append("g")
    .attr("transform", `translate(-72,0)`);
var addG = controlsGroup.append("g")
    .attr("transform", `translate(-48,0)`);
var subtractG = controlsGroup.append("g")
    .attr("transform", `translate(-24,0)`);

pauseG.append("svg:title")
    .text("Pause and resume animation.")
reloadG.append("svg:title")
    .text("Clear all datapoints.");
shuffleG.append("svg:title")
    .text("New seed for samples.");
addG.append("svg:title")
    .text("Add function sample.")
subtractG.append("svg:title")
    .text("Remove one function sample.")

pauseG.append("rect")
    .attr("x", -12)
    .attr("y", -12)
    .attr("width", 24)
    .attr("height", 24)
    .attr("fill", "black")
    .attr("opacity", 0.0);

var pauseSvg,
    playSvg;
d3.xml("./images/pause-24px.svg", function (error, documentFragment) {
    if (error) {console.log(error); return;}
    
    var svgNode = documentFragment.getElementsByTagName("svg")[0];
    pauseSvg = pauseG.append("g")
        .attr("transform", `translate(-12,-12)`)
        .attr("opacity", paused ? 0.0 : 1.0)
        .html(svgNode.innerHTML);
})
d3.xml("./images/play_arrow-24px.svg", function (error, documentFragment) {
    
    if (error) {console.log(error); return;}
    var svgNode = documentFragment.getElementsByTagName("svg")[0];
    playSvg = pauseG.append("g")
        .attr("transform", `translate(-12,-12)`)
        .attr("opacity", paused ? 1.0 : 0.0)
        .html(svgNode.innerHTML);
})
pauseG.on("click", function () {
    pause();
    pauseSvg.attr("opacity", paused ? 0.0 : 1.0);
    playSvg.attr("opacity", paused ? 1.0 : 0.0);
    d3.event.stopPropagation()
})

reloadG.append("rect")
    .attr("width", 24)
    .attr("height", 24)
    .attr("x", -12)
    .attr("y", -12)
    .attr("fill", "black")
    .attr("opacity", 0.0);
var reloadSvg;
d3.xml("./images/clear-24px.svg", function (error, documentFragment) {
    
    if (error) {console.log(error); return;}
    var svgNode = documentFragment.getElementsByTagName("svg")[0];
    reloadSvg = reloadG.append("g")
        .attr("transform", `translate(-12,-12)`)
        .html(svgNode.innerHTML);
})
reloadG.on("click", function () {
    GP.removeDatapoints(GP.datapoints);
    d3.selectAll(".datapoint")
        .remove();
    updateAnimation();
    reloadG.transition()
        .duration(10)
        .ease(d3.easeLinear)
        .style("opacity", 0.0)
        .transition()
        .delay(180)
        .duration(10)
        .ease(d3.easeLinear)
        .style("opacity", 1);
    d3.event.stopPropagation();
})

shuffleG.append("rect")
    .attr("width", 24)
    .attr("height", 24)
    .attr("x", -12)
    .attr("y", -12)
    .attr("fill", "black")
    .attr("opacity", 0.0);

d3.xml("./images/shuffle-24px.svg", function (error, documentFragment) {
    
    if (error) {console.log(error); return;}
    var svgNode = documentFragment.getElementsByTagName("svg")[0];
    shuffleG.append("g")
        .attr("transform", `translate(-12,-12)`)
        .html(svgNode.innerHTML);
})
shuffleG.on("click", function () {
    newSeed();
    d3.event.stopPropagation();
})
addG.append("rect")
    .attr("width", 24)
    .attr("height", 24)
    .attr("x", -12)
    .attr("y", -12)
    .attr("fill", "black")
    .attr("opacity", 0.0);

d3.xml("./images/add-24px.svg", function (error, documentFragment) {
    
    if (error) {console.log(error); return;}
    var svgNode = documentFragment.getElementsByTagName("svg")[0];
    addG.append("g")
        .attr("transform", `translate(-12,-12)`)
        .html(svgNode.innerHTML);
});
addG.on("click", function () {
    var sampler = lineSampler(GP.sampler(15), plotGroup, lineSamplers.length);
    lineSamplers.push(sampler);
    sampler.next();
});

subtractG.append("rect")
    .attr("width", 24)
    .attr("height", 24)
    .attr("x", -12)
    .attr("y", -12)
    .attr("fill", "black")
    .attr("opacity", 0.0);

d3.xml("./images/remove-24px.svg", function (error, documentFragment) {
    
    if (error) {console.log(error); return;}
    var svgNode = documentFragment.getElementsByTagName("svg")[0];
    subtractG.append("g")
        .attr("transform", `translate(-12,-12)`)
        .html(svgNode.innerHTML);
});
subtractG.on("click", function () {
    var sampler = lineSamplers.pop();
    if (sampler) {
        sampler.next("remove");
    }
});



const titleLeftGroup = titleGroup.append("g")
    .attr("class", "kernelControl");
titleLeftGroup.append("rect")
    .attr("x", 0)
    .attr("y", -24)
    .attr("width", 24)
    .attr("height", 37)
    .on("click", function() {
        var idx = kernels.findIndex((el)=> el.name === GP.kernel.name);
        changeKernel((idx + kernels.length - 1) % kernels.length);
    });
d3.xml("./images/keyboard_arrow_left-24px.svg", function (error, documentFragment) {
    if (error) {console.log(error); return;}
    var svgNode = documentFragment.getElementsByTagName("svg")[0];
    titleLeftGroup.append("g")
        .attr("class", "controlSVG")
        .attr("transform", `translate(0,-12)`)
        .html(svgNode.innerHTML);
});

const titleMiddleGroup = titleGroup.append("g")
    .attr("transform", `translate(${24},0)`)
    .attr("class", "titleMiddleGroup");

const titleTextGroup = titleMiddleGroup.append("g")
    .attr("class", "titleTextGroup");

titleTextGroup.append("rect")
    .attr("x", 0)
    .attr("y", -24)
    .attr("width", 221)
    .attr("height", 37)
    .attr("fill", "white")
    .style("opacity", 1);

const titleText = titleTextGroup.append("text")
    .attr("class", "kernelName")
    .attr("x", 0)
    .attr("y", 7)
    .attr("width", 200)
    .text(`${GP.kernel.name}`);

const kernelSelectGroup = titleMiddleGroup.append("g")
    .attr("class", "kernelSelectGroup");

const generateKernelMenu = function() {
    var kernelChoiceGroup = kernelSelectGroup
            .append("g")
            .on("mouseleave", function() {
                kernelSelectGroup.html(null);
            });
    
        kernelChoiceGroup.append("g")
            .attr("class", "kernelSelect")
            .on("click", function () {
                d3.event.stopPropagation();
                kernelSelectGroup.html(null);
                })
            .append("rect")
            .attr("x", 0)
            .attr("y", -12)
            .attr("width", 220)
            .attr("height", 48);
        for (var i = 0; i < kernels.length; i++) {
            ((i) => {
            var kernelSelect = kernelChoiceGroup.append("g")
                .attr("class", "kernelSelect")
                .on("click", function() {;    
                    changeKernel(i);
                    d3.event.stopPropagation();
                    kernelSelectGroup.html(null);
                });
            kernelSelect.append("rect")
                .attr("x", 0)
                .attr("y", 36+40*i)
                .attr("width", 220)
                .attr("height", 40)
                .attr("fill", "white");
            var kernelText = kernelSelect.append("text")
                .attr("class", "kernelName")
                .attr("x", 0)
                .attr("y", 48+7+40*i)
                .attr("width", 200)
                .text(`${kernels[i].name}`);
            kernelSelect
                .on("mouseenter", function() {
                    kernelText.classed("highlight", true);
                })
                .on("mouseleave", function () {
                    kernelText.classed("highlight", false);
                });
            })(i);
        }
        d3.event.stopPropagation();
}


titleTextGroup.on("mouseenter", generateKernelMenu)
    .on("click", generateKernelMenu);

const titleRightGroup = titleGroup.append("g")
    .attr("class", "kernelControl")
    .attr("transform", `translate(244,0)`); 
titleRightGroup.append("rect")
    .attr("x", 0)
    .attr("y", -24)
    .attr("width", 24)
    .attr("height", 37);
d3.xml("./images/keyboard_arrow_right-24px.svg", function (error, documentFragment) {
    if (error) {console.log(error); return;}
    var svgNode = documentFragment.getElementsByTagName("svg")[0];
    titleRightGroup.append("g")
        .attr("class", "controlSVG")
        .attr("transform", `translate(0,-12)`)
        .html(svgNode.innerHTML);
});
titleRightGroup.on("click", function() {
    var idx = kernels.findIndex((el)=> el.name === GP.kernel.name);
    changeKernel(++idx % kernels.length);
})

let area = d3.area()
    .x(d => xScale(d[0]))
    .y0(d => yScale(d[1]-2*Math.sqrt(d[2])))
    .y1(d => yScale(d[1]+2*Math.sqrt(d[2])));
    
let valueline = d3.line()
    .x(function(d) { return xScale(d[0]); })
    .y(function(d) { return yScale(d[1]); });

var credabilityInterval = plotGroup.append("path")
    .data([d3.zip(GP._testpoints, GP.predictiveMean,  GP.predictiveVariance)])
    .attr("class", "area")
    .attr("d", area);

var meanLine = plotGroup.append("path")
    .attr("class", "meanLine")
    .attr("d", valueline(d3.zip(GP._testpoints, GP.predictiveMean)));

//      x-axis
const xAxisG = plotGroup.append("g")
    .attr("transform", `translate(0,${plotAreaHeight})`)
    .attr("class", "axis");
const xAxis = d3.axisBottom(xScale);

// Add y axis
const yAxisG = plotGroup.append("g")
    .attr("class", "axis");
const yAxis = d3.axisLeft(yScale);

xAxisG.call(xAxis);
yAxisG.call(yAxis);

function updateAnimation() {
    lineSamplers.forEach(d=>d.next("same"));
    if (credabilityInterval) {
        credabilityInterval.transition()
            .duration(200)
            .ease(d3.easeLinear)
            .attr("d", area(d3.zip(GP._testpoints, GP.predictiveMean, GP.predictiveVariance)))
    }

    if (meanLine) {
        meanLine.transition()
            .duration(200)
            .ease(d3.easeLinear)
            .attr("d", valueline(d3.zip(GP._testpoints, GP.predictiveMean)));
    }
}

function newSeed() {
    lineSamplers.forEach(sampler=>sampler.next("seed"));
}

function pause() {
    paused = !paused;
}

function setMeasurementNoise(val) {
    GP.measurementNoiseVariance = val;
    updateAnimation();
}

function changeKernel(idx) {
    GP.kernel = kernels[idx];
    titleText.text(GP.kernel.name);
    //kernelTitle.text(GP.kernel.name);
    katex.render(
        `\\rule{0pt}{5ex}\\kappa(t, s) = ${GP.kernel.kernelInfo.latex}`,     
        kernelFunctionExpression.node(),
        {
            displayMode: false,
            fleqn: false,
            macros: ""
        }
    );
    
    parameterList.html(null);
    var kernel = GP.kernel;
    kernel.parameterValue.forEach(function (d, i) {
        const parameterInfo = kernel.parameterInfo;
        
        const parameter = parameterList.append("div")
            .attr("class", "parameter");
        
        const parameterSlider = parameter.append("div")
            .attr("class", "parameterSliderWrapper")
            .append("input")
            .attr("type", "range")
            .attr("min", parameterInfo.min[i])
            .attr("max", parameterInfo.max[i])
            .attr("value", d)
            .attr("step", parameterInfo.step)
            .attr("class", "parameterSlider");
        
        const parameterValueWrapper = parameter.append("div")
                .attr("class", "parameterValueWrapper");
        const parameterText = parameterValueWrapper.append("div")
            .attr("class", "parameterText");
        
        katex.render(
            parameterInfo.latex[i]+"=",
            parameterText.node()
            )
        
        const parameterValue = parameterText.append("span")
            .attr("class", "parameterValue")
            .html(d);
                
        parameterSlider.on("input", function () {
            var value = parseFloat(parameterSlider.node().value),
                currPar = GP.kernelParameters;
            if (GP.kernel.parameterInfo.integer[i]) {
                value = Math.round(value);
            };
            this.value = value;
            parameterValue.html(value);
            currPar[i] = value;
            GP.kernelParameters = currPar;
            updateAnimation();
            });
        });
    updateAnimation();
}

const foreignObject = svg.append("foreignObject")
    .attr("x", margin.left)
    .attr("y", margin.top+plotAreaHeight)
    .attr("width", plotAreaWidth)
    .attr("height", margin.bottom)
    .append("xhtml:div")
    .attr("class", "foreignObject");

const foreignObjectLeft = foreignObject.append("div")
    .attr("id", "foreignObjectLeft");

const kernelExpression = foreignObjectLeft.append("div")
    .attr("class", "kernelexpression");
const kernelFunctionExpression = kernelExpression.append("div")
    .attr("class", "kernelfunctionexpression");

const foreignObjectRight = foreignObject.append("div")
    .attr("id", "foreignObjectRight");

const likelihood = foreignObjectRight.append("div")
    .attr("class", "kernelexpression")
    .append("div")
    .attr("class", "kernelfunctionexpression");

katex.render(
    "y \\mid f(x) \\sim \\mathcal{N}(f(x) , \\sigma_n^2)",
    likelihood.node());


(function g() {
    const parameterList = foreignObjectRight.append("div")
        .attr("class", "parameterList")
    
    const parameter = parameterList.append("div")
            .attr("class", "parameter");
    
    const parameterSlider = parameter.append("div")
        .attr("class", "parameterSliderWrapper")
        .append("input")
        .attr("type", "range")
        .attr("min", 0.0)
        .attr("max", 4)
        .attr("value", GP.measurementNoiseVariance)
        .attr("step", 0.02)
        .attr("class", "parameterSlider");

    const parameterValueWrapper = parameter.append("div")
            .attr("class", "parameterValueWrapper");
    const parameterText = parameterValueWrapper.append("div")
        .attr("class", "parameterText");

    katex.render(
        "\\sigma_n^2"+"=",
        parameterText.node()
        )

    const parameterValue = parameterText.append("span")
        .attr("class", "parameterValue")
        .html(GP.measurementNoiseVariance);

    parameterSlider.on("input", function () {
        var value = parseFloat(parameterSlider.node().value);
        
        parameterSlider.node().value = value;
        parameterValue.html(value);
        GP.measurementNoiseVariance = value;
        updateAnimation();
        });
})();


/*const kernelTitle = foreignObjectLeft
    .append("div")
    .style("position", "relative")
    .style("min-height", "80px")
    .append("div")
    .attr("class", "kernelTitle")
    .html(GP.kernel.name);*/

//const kernelFunctionExpression = foreignObjectRight
//    .append("div")
//    .attr("class", "kernelfunctionexpression");

const parameterList = foreignObjectLeft.append("div")
    .attr("class", "parameterList");
    //.style("height", `${margin.bottom}px`);

changeKernel(0)
function repeat() {
    if (!paused) {
        lineSamplers.forEach(d=>d.next())
    }
}
d3.interval(repeat, 200);
