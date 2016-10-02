
var Task = require('../lib').Task
    , options = { getRandomSolution : getRandomSolution
    , popSize : 50
    , elitismSize: 20
    , stopCriteria : stopCriteria
    , fitness : fitness
    , minimize : false
    , mutateProbability : 0.1
    , mutate : mutate
    , crossoverProbability : 0.3
    , crossover : crossover
}
    , util = require('util')

// node 0 is the start and the end vertex
var numVerts;
var graph;

const BIGNUM = 1e9;

var setEdge = function(u, v, w) {
    graph[u][v] = w;
    graph[v][u] = w;
}

var getEdge = function(u, v) {
    return graph[u][v]
}

function crossover(parent1, parent2, callback) {
    var child = {};
    child.data = [];

    //console.log("co: ", parent1, parent2)


    var i = Math.floor(Math.random()*parent1.data.length);
    var j = i;
    while(j == i) j = Math.floor(Math.random()*parent1.data.length);

    if(j < i) {
        let t = i;
        i = j;
        j = t;
    }


    //console.log("crossover ", i, j)
    var used = [];

    for(var k = 0; k < parent1.data.length; k++) {
        if(i <= k && k <= j) {
            child.data[k] = parent1.data[k];
            used[child.data[k]] = true
        }
    }

    var childIdx = 0;
    while(!!child.data[childIdx] && childIdx < parent1.data.length) childIdx++;

    for(var k = 0; k < parent1.data.length; k++) {
        if(!used[parent2.data[k]]) {
            child.data[childIdx] = parent2.data[k];
            used[parent2.data[k]] = true
            while(!!child.data[childIdx] && childIdx < parent1.data.length) childIdx++;
        }
    }

    callback(child)
}


//crossover([1, 2, 3, 4, 5], [4, 5, 3, 1, 2], console.log);


function mutate(solution, callback) {
    var i = Math.floor(Math.random()*solution.data.length);
    var j = i;
    while(j == i) j = Math.floor(Math.random()*solution.data.length);

    if(j < i) {
        let t = i;
        i = j;
        j = t;
    }


    // swap them
    var _t = solution.data[i];
    solution.data[i] = solution.data[j];
    solution.data[j] = _t;

    callback(solution)
}

var shuffle = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getRandomSolution(callback) {

    var solution = {};
    solution.data = [];
    for(var i = 1; i < numVerts; i++) {
        solution.data.push(i);
    }

    solution.data = shuffle(solution.data)


    //var solution = { a: Math.random(), b: Math.random(), c: Math.random() }
    callback(solution)
}



function stopCriteria() {
    return (this.generation == 1000)
}

function fitness(solution, callback) {
    var path = getEdge(0, solution.data[0]);

    for(var i = 1; i < solution.data.length; i++) {
        path += getEdge(solution.data[i-1], solution.data[i]);
       // console.log(solution.data[i-1], solution.data[i], getEdge(solution.data[i-1], solution.data[i]));
        //console.log()
    }

    path += getEdge(solution.data[numVerts-2], 0);

    callback(BIGNUM - path);

}


console.log('=== TEST BEGINS === ')

// adjacancy matrix of the graph
numVerts = 50;
graph = [ ];
for(var i = 0; i < numVerts; i++) {
    graph[i] = [];
}

//generate a random graph
for(var i = 0; i < numVerts; i++) {
    for(var j = i; j < numVerts; j++) {
        graph[i][j] = Math.random()*30;
        graph[j][i] = Math.random()*30;
    }
}


var t = new Task(options)

t.on('statistics', function (statistics) { console.log("result on generation " + this.generation + ": ", BIGNUM - statistics.maxScore)})

t.on('error', function (error) { console.log('ERROR - ', error) })
t.run(function (stats) { console.log('results', BIGNUM - stats.maxScore)})
