function getDirection(a, b) {
	return (a[0] - b[1]) * (a[1] - b[0]);
}

function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}

HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

function Vector(x, y) {
	this.x = x;
	this.y = y;
}

Vector.prototype = {
	crossProduct: function(v) {
		return this.x * v.y - this.y * v.x;
	},

	subtract: function(v) {
		return new Vector(this.x - v.x, this.y - v.y);
	},

	add: function(v) {
		return new Vector(this.x + v.x, this.y + v.y);
	},

	distance: function(v) {
		return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
	},

	withNumber: function(number) {
		var v = new Vector(this.x, this.y);
		v.i = number;
		return v;
	}
};

function Shape() {
	this.dots = [];
}

Shape.prototype = {
	add: function(p) {
		this.dots.push(p);
	},

	remove: function(p) {
		return false;
	},

	hasEmptyCell: function(cell_size) {
		if (this.dots.length === 0)
			return false;
		var x1 = x2 = this.dots[0].x, y1 = y2 = this.dots[0].y;

		for (var i = 0, l = this.dots.length; i < l; i++) {
			x1 = Math.min(x1, this.dots[i].x);
			x2 = Math.max(x2, this.dots[i].x);
			y1 = Math.min(y1, this.dots[i].y);
			y2 = Math.max(y2, this.dots[i].y);
		}

		var DEBUG = false;
		DEBUG && console.log(x1, y1, x2, y2);

		var e = 0.0001; // precision
		for (var x = x1; x < x2; x += cell_size)
			for (var y = y1; y < y2; y += cell_size) {
				DEBUG && console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
				DEBUG && console.log('Testing next cell: ', x, y);
				var inside_count = 0;
				
				cross_loop: for (var diff = 0; diff < 4; diff ++) {
					var cross_count = 0;
					var px = x + (diff % 2) * cell_size,
						py = y + Math.floor(diff / 2) * cell_size;

					DEBUG && console.log('----------------');
					DEBUG && console.log('Point:', px, py);

					for (i = 0; i < l; i++) {
						var p1 = this.dots[i];
						var p2 = this.dots[(i + 1) % l];
						
						DEBUG && console.log('Line:', p1, p2);

						// lets add more science
						var a1 = p1.y - p2.y;
						var b1 = p2.x - p1.x;
						var c1 = p1.x * p2.y - p1.y * p2.x;


						var a2 = -0.765;
						var b2 = 1;
						var c2 = -px * a2 - py * b2;

						var d = a1 * b2 - b1 * a2;
						var dx = c1 * b2 - b1 * c2;
						var dy = a1 * c2 - c1 * a2;

						if (d === 0) {
							alert('WOW');
							i--;
							continue;
						} else {
							var cross_x = - dx / d;
							var cross_y = - dy / d;

							DEBUG && console.log('Crossing', cross_x, cross_y);

							if (cross_y > py) {
								continue;
							}

							if (Math.abs(cross_y - py) < 0.0001) {
								inside_count++;
								continue cross_loop;
							}

							if (Math.min(p1.x, p2.x) <= cross_x && cross_x <= Math.max(p1.x, p2.x) &&
								Math.min(p1.y, p2.y) <= cross_y && cross_y <= Math.max(p1.y, p2.y)) {
								cross_count++;
							}
						}
						/*
						if (p1.x !== p2.x) {
							var goalY = p1.y + (0. + p2.y - p1.y) / (p2.x - p1.x) * (px - p1.x);
							if (goalY < py) {

								DEBUG && console.log('Goal y', goalY);

								cross_count += (p1.x === px) ? 1 : 0;
							} else if (goalY === py) {
								inside_count++;
								continue cross_loop;
							}
						} else if (p1.x === px) {
							if ((py >= p1.y && py <= p2.y) || (py <= p1.y && py >= p2.y)) {
								inside_count++;
								continue cross_loop;
							}
							cross_count++;
						}
						DEBUG && console.log('Cross count', cross_count); */
					}
					DEBUG && console.log('Final cross count', cross_count);
					if (Math.round(cross_count) % 2 === 1)
						inside_count ++;
				}
				DEBUG && console.log('Inside count', inside_count);
				if (inside_count === 4) {					
					DEBUG && console.log('Returned true for: ', x, y);
					DEBUG && console.log(this);


					return true;
				}
			}

		// console.log(this.dots);
		return false;
	},

	getPerimeter: function() {
		var dist = 0.;
		for (var i = 0, l = this.dots.length; i < l; i++) {
			var a = this.dots[i];
			var b = this.dots[(i + 1) % l];
			dist += Math.sqrt( (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) );
		}
		return dist;
	},

	getSquares: function(cell_size) {
		var squares = [];

		var start = Date.now();

		for (var i = 0, l = this.dots.length; i < l; i++) {
			var a = this.dots[i];
			var b = this.dots[(i + 1) % l];

			var x1 = Math.floor( Math.min(a.x, b.x) / cell_size) * cell_size;
			var x2 = (Math.floor( Math.max(a.x, b.x) / cell_size) + 1) * cell_size;

			var y1 = Math.floor( Math.min(a.y, b.y) / cell_size) * cell_size;
			var y2 = (Math.floor( Math.max(a.y, b.y) / cell_size) + 1) * cell_size;

			var vector = a.subtract(b);

			for (var x = x1; x < x2; x += cell_size)
				for (var y = y1; y < y2; y += cell_size) {
					var m1 = vector.crossProduct( a.subtract( new Vector(x, y))) ;
					var m2 = vector.crossProduct( a.subtract( new Vector(x + cell_size, y + cell_size)));

					var m3 = vector.crossProduct( a.subtract( new Vector(x + cell_size, y)));
					var m4 = vector.crossProduct( a.subtract( new Vector(x, y + cell_size)));

					if (m1 * m2 <= 0 || m3 * m4 <= 0) {
						squares.push(new Vector(x, y));
					}
				}
		};
		var end = Date.now();

		return squares;
	},

	calculateConvexHull: function(cell_size) {
		var leftmost = 0;
		for (var i = 0; i < this.dots.length; i++)
			if (this.dots[i].x < this.dots[leftmost].x)
				leftmost = i;
			else if (this.dots[i].x === this.dots[leftmost].x)
				if (this.dots[i].y < this.dots[leftmost].y)
					leftmost = i;

		var l = this.dots.length;

		var s = new Shape();
		s.add( this.dots[leftmost].withNumber(leftmost));
		s.add( this.dots[(leftmost + 1) % l].withNumber(leftmost));

		var desiredSwitch = 1;

		var skipped = [];

		for (var i = leftmost + 2, l = this.dots.length, e = leftmost + l; i < e; i++) {

			var c = this.dots[i % l];

			if (s.dots.length < 2) {
				s.add(c.withNumber(i));
				continue;
			}

			var a = s.dots[s.dots.length - 2];
			var b = s.dots[s.dots.length - 1];
			
			var v1 = a.subtract(b);
			var v2 = a.subtract(c);

			var angle = v1.crossProduct(v2);
			if (angle * desiredSwitch + 0.0001 >= 0) {
				s.add(c.withNumber(i));
			} else {
				console.log("Oups!");

				var smallShape = new Shape();
				var ind = a.i;
				for (var ind = a.i; ind <= i; ind++)
					smallShape.add(this.dots[ind % l]);

				if (smallShape.hasEmptyCell(cell_size)) {
					desiredSwitch *= -1;
				} else {
					var last = s.dots.pop();
					skipped.push(last);
				}

				i--;
			}
		}

		var q = '';
		for (var i = 0; i < skipped.length; i++)
			q += skipped[i].i + " ";

		// console.log('Skipped', q, skipped);

		return s;
	}
};

function Scene(canvas) {
	this.canvas = canvas;
	this.c = canvas.getContext('2d');
	this.width = canvas.width;
	this.height = canvas.height;
}

Scene.prototype = {
	clear: function() {
		this.canvas.width = this.canvas.width;
	},

	drawGrid: function(cell_size) {
		//c.lineWidth = 0.5;
		this.c.strokeStyle = 'lime';
		for (var i = 0; i < this.width; i+= cell_size) {
			this.c.beginPath();
			this.c.moveTo(i, 0);
			this.c.lineTo(i, this.height);
			this.c.stroke();
		}

		for (var i = 0; i < this.height; i+= cell_size) {
			this.c.beginPath();
			this.c.moveTo(0, i);
			this.c.lineTo(this.width, i);
			this.c.stroke();
		}
	},

	fillShape: function(shape, color) {
		this.c.beginPath();
	    (shape.dots.length > 0) && this.c.moveTo(shape.dots[0].x, shape.dots[0].y);
	    for (var i = 1, l = shape.dots.length; i < l; i++) {
	   		this.c.lineTo(shape.dots[i].x, shape.dots[i].y);
	    }
	    this.c.closePath();

	    this.c.fillStyle = color || "lime";
	    this.c.fill();
	},

	fillSquares: function(squares, cell_size, color) {
		this.c.fillStyle = color || 'cyan';
		for (var i = 0, l = squares.length; i < l; i++) {
			this.c.fillRect(squares[i].x, squares[i].y, cell_size, cell_size);
		}
	},

	drawShape: function(shape, color) {
		this.c.lineWidth = 1;
		this.c.strokeStyle = color || 'black';

	   	this.c.beginPath();
	   	(shape.dots.length > 0) && this.c.moveTo(shape.dots[0].x, shape.dots[0].y);
	   	for (var i = 1, l = shape.dots.length; i < l; i++) {
	   		this.c.lineTo(shape.dots[i].x, shape.dots[i].y);
	   	}
	   	this.c.closePath();
	   	this.c.stroke();
	}
};

window.onload = function() {
	var canvas = document.getElementById('canvas');

	var width = canvas.width,
		height = canvas.height;

	var scene = new Scene(canvas);
	var shape = new Shape();

	var N = 10;
	
	var perimeterSpan = document.getElementById('perimeter');
	var verticesSpan = document.getElementById('vertices');
	var outputSpan = document.getElementById('algo_perimeter');

	var gridCheckbox = document.getElementById('grid');
	var shapeCheckbox = document.getElementById('shape');
	var fillCheckbox = document.getElementById('fill');
	var borderCheckbox = document.getElementById('border');

	var recalculateCheckbox = document.getElementById('recalculate');

	document.getElementById('grid_size').textContent = N;

	document.getElementById('grid_size').addEventListener('change', function() {
		N = parseInt(this.value);
		update();
	});

	document.getElementById('undo').addEventListener('click', function() {
		shape.dots.pop();
		update();
	});

	document.getElementById('clear').addEventListener('click', function() {
		shape.dots = [];
		update();
	});

	canvas.addEventListener('click', function(e) {
		var pos = canvas.relMouseCoords(e);

		shape.add(new Vector(pos.x, pos.y));

		update();
	});

	var update = function() {
		draw();

		verticesSpan.textContent = shape.dots.length;

		var d = shape.getPerimeter();
		perimeterSpan.textContent = d.toFixed(2);
	};

	scene.drawGrid(N);

	var draw = function() {
		scene.clear();
		gridCheckbox.checked && scene.drawGrid(N);

		fillCheckbox.checked && scene.fillShape(shape);

		var squares = shape.getSquares(N);
		
		borderCheckbox.checked && scene.fillSquares(squares, N);

		shapeCheckbox.checked && scene.drawShape(shape);

		if (recalculateCheckbox.checked) {
			if (shape.dots.length < 3)
				return;
			var newShape = rebuildShape(squares);
			// drawShape(newShape, 'red');

			var convexHull = newShape.calculateConvexHull(N);
			scene.drawShape(convexHull, '#a0a');

			var newPerimeter = convexHull.getPerimeter().toFixed(2);
			algo_perimeter.textContent = newPerimeter;
		}
	};

	var logMatrix = function(matrix) {
		console.log('  ');
		for (var i = 0; i < matrix.length; i++) {
			var s = '';
			for (var j = 0; j < matrix[i].length; j++)
				s += matrix[i][j] === true ? '#' : matrix[i][j] === false ? '.' : matrix[i][j];
			console.log(s);
		}
	}

	var rebuildShape = function(squares) {
		var s = new Shape();

		if (!(squares && squares.length))
			return s;

		var sortFunction = function(a, b) {
			return a.x < b.x ? -1 : b.x < a.x ? 1 :
			a.y < b.y ? -1 : b.y < a.y ? 1 : 0;
		};

		squares.sort(sortFunction);

		var rows = width / N;
		var cols = height / N;
		var matrix = [];

		for (var i = 0; i < rows; i++) {
			var row = [];
			for (var j = 0; j < cols; j++)
				row.push(false);
			matrix.push(row);
		}

		for (var i = 0; i < squares.length; i++)
			matrix[squares[i].y / N][squares[i].x / N] = true;

		return solveMatrix(matrix);
	};

	var solveMatrix = function(matrix) {

		var moves = [
			{x: 0, y: 1},
			{x: 1, y : 0},
			{x: 0, y: -1},
			{x: -1, y : 0}
		];

		var i, j;
		loop: for (i = 0; i < matrix.length; i++)
			for (j = 0; j < matrix[i].length; j++)
				if (matrix[i][j])
					break loop;

		var start = new Vector(i, j);

		matrix[i][j] = 2;
		var current = start;

		var s = new Shape();
		s.add(new Vector(j * N, i * N));

		var d = -1;

		var iterations = 0;

		loop: while (true) {
			//console.log('next iteration');
			var nextD = (d + 3) % 4;

			iterations++;
			if (iterations > 1000)
				break;

			for (var k = nextD; k < nextD + 4; k++) {
				var diff = moves[k % 4];
				var nextPoint = current.add(diff);
				//console.log(k, diff, current, nextPoint);
				if (nextPoint.x >= 0 && nextPoint.x < matrix.length &&
					nextPoint.y >= 0 && nextPoint.y < matrix[0].length) {

					if (matrix[nextPoint.x][nextPoint.y] !== false) {
						if (nextPoint.x == start.x && nextPoint.y == start.y)
							break loop;

						//console.log(nextPoint);

						var d = (d + 4) % 4;
						var k = (k + 4) % 4;
						if (d != k) {
							var lastMove = moves[d];
							var dx = 0, dy = 0;
							if ((d + 1) % 4 == k) {
								switch (d) {
									case 0: dy = N; break;
									case 1: dx = N; dy = N; break;
									case 2: dx = N; break;
								}
							}
							if ((d + 3) % 4 == k) {
								switch (d) {
									case 0:  break;
									case 1: dy = N; break;
									case 2: dx = N; dy = N; break;
									case 3: dx = N; break;
								}
							}

							// 180-turn
							// should go back
							if ((d + 2) % 4 == k) {
								switch(d) {
									case 0: s.add(new Vector(current.y * N + N, current.x * N));
											s.add(new Vector(current.y * N + N, current.x * N + N)); break;
									case 1: s.add(new Vector(current.y * N + N, current.x * N + N));
											s.add(new Vector(current.y * N, current.x * N + N)); break;
									case 2: s.add(new Vector(current.y * N, current.x * N + N));
											s.add(new Vector(current.y * N, current.x * N)); break;
									case 3: s.add(new Vector(current.y * N, current.x * N));
											s.add(new Vector(current.y * N + N, current.x * N)); break;
								}
							} else {
								s.add(new Vector(current.y * N + dy, current.x * N + dx));
							}
						}

						d = k;

						current = nextPoint;
						matrix[nextPoint.x][nextPoint.y] = d;

						continue loop;
					}
				}
			}
			break;
		}

		s.add(new Vector(current.y * N, current.x * N ));

		// logMatrix(matrix);

		return s;
	};

	gridCheckbox.addEventListener('change', update);
	shapeCheckbox.addEventListener('click', update);
	fillCheckbox.addEventListener('click', update);
	borderCheckbox.addEventListener('click', update);
	recalculateCheckbox.addEventListener('click', update);


	(function() {
		var shape = new Shape();

		shape.add(new Vector(100, 200));
		shape.add(new Vector(100, 100));
		shape.add(new Vector(200, 100));

		/* shape.add(makeVector(100, 0));
		shape.add(makeVector(100, 300));
		shape.add(makeVector(0, 300));
		shape.add(makeVector(0, 200)); */

		// console.log( shape.hasEmptyCell(100) );
	}());
}