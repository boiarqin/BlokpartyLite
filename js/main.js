/*
* BLOKPARTY LITE
* Boiar Qin 2012
*/

/*
* GLOBAL VARIABLES FOR REFERENCE
*/
//TODO: Clean up/consolidate all the vars
//CANVAS
var canvasElem = document.getElementById('gameBoard');
var context;
var valid = false; //set to false when canvas needs to be redrawn
var dragging = false; //is user dragging the piece?
var dragoffx = 0; //offset of mouse from top-left of piece
var dragoffy = 0;
//BOARD PROPERTIES
var boardSquares = 20;
var boardSquareWidth = 25; //individual squares are 25px wide (without borders)
var borderWidth = 1;
var boardWidth = boardSquareWidth*boardSquares + boardSquares*borderWidth;
var board = new Array(boardSquares); //represents the physical board--what color is a square?
	for (var i=0; i< boardSquares; i++){
		board[i] = new Array(boardSquares);
	}
var moves = new Array(boardSquares);
	/* represents the possible moves--who can move where?
	 * each element is a 4-digit number consisting of 0,1,2s
	 * 2-unplayable area; 1-playable area; 0-fillable area  
	 * [4th player][3rd player][2nd player][1st player]
	 */
	for (var i=0; i<boardSquares; i++){
		//each square is 0000
		moves[i] = new Array(boardSquares);
	}
	//each player starts at one corner
	moves[0][0] 						 ='0001'; //red
	moves[0][boardSquares-1] 			 ='0010'; //yellow
	moves[boardSquares-1][boardSquares-1]='0100'; //green
	moves[boardSquares-1][0]			 ='1000'; //blue
//BOARD POSITIONING
var leftMargin = 20.5; //of board
var topMargin = 20.5;
//PIECE PROPERTIES
var numPieces = 21;
var pieceWidth = 10;
var pieces = {'red': new Array(numPieces),
				'yellow': new Array(numPieces),
				'green': new Array(numPieces),
				'blue': new Array(numPieces)};
//PIECE "CLASS"
function Piece(color, boardRep, moveRep){
	this.color = color;
	this.boardRep = boardRep; //0=empty square; 1=normal square; 2=corner;
	this.moveRep = moveRep; //0=unfillable by this color in the future; 1=future corners;
	this.tlX; //top left coords
	this.tlY;
	this.h;
	this.w;
	this.points = 0;
}

//PIECE CONTAINER POSITIONING [X, Y]
var leftMarginOfContainer = leftMargin + boardWidth;
var containerWidth = 420;
var containerHeight = 8*pieceWidth;
var yMarg = 5;
var containerPos = {'red': [0,0],
					'yellow': [0,0],
					'green': [0,0],
					'blue': [0,0]};
//EDIT PANE POSITIONING
var leftMarginOfEditPane = leftMargin + boardWidth;
var topMarginOfEditPane = topMargin + 32*pieceWidth + 20;
var editPaneHeight = boardWidth - topMarginOfEditPane -.5;
var buttonSize = 40;
var buttons = {'rotateCW': [0,0],
				'flipHoriz': [0,0],
				'flipVert': [0,0]};
var rotateCW_button = new Image(); rotateCW_button.src = './img/rotate.png';
var flipHoriz_button = new Image(); flipHoriz_button.src = './img/flip_horiz.png';
var flipVert_button = new Image(); flipVert_button.src = './img/flip_vert.png';
				
//PLAYER/COLOR PROPERTIES
var colors = {'red':3,'yellow':2,'green':1,'blue':0};
var hexColors = {'red' : '#f00',
				'yellow' : '#ff0',
				'green' : '#0f0',
				'blue' : '#00f'};
//CURRENT GAMES				
var currentPlayers = ['red', 'yellow', 'green', 'blue'];
var currentColor = 'red';
var currentPiece;
var currentPieceId; //position of current piece in array of player's pieces
var gameOver = false; //true when no player is able to play any more
var scores = {'red' : 0,
			'yellow' : 0,
			'green' : 0,
			'blue' : 0};

/*
* INITIALIZERS
*/
//TODO: INITIALIZE ALL 21 PIECES OF ONE COLOR
function initPieces(color){
	//monomino, duomino, triomino
	pieces[color][0] = new Piece(color, [[2]], [[1, 0, 1], [0, 0, 0], [1, 0, 1]]);
	pieces[color][1] = new Piece(color, [[2],[2]], [[1, 0, 1], [0, 0, 0], [0, 0, 0], [1, 0, 1]]);
	pieces[color][2] = new Piece(color, [[2, 0],[2, 2]], [[1, 0, 1, 2], [0, 0, 0, 1], [0, 0, 0, 0], [1, 0, 0, 1]]);
	pieces[color][3] = new Piece(color, [[2],[1],[2]], [[1, 0, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 0, 1]]);
	//tetromino
	pieces[color][4] = new Piece(color, [[2],[1],[1],[2]], [[1, 0, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 0, 1]]);
	pieces[color][5] = new Piece(color, [[0,2],[0,1],[2,2]], [[2, 1, 0, 1], [2, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 1]]);
	pieces[color][6] = new Piece(color, [[2,0],[1,2],[2,0]], [[1, 0, 1, 2], [0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 1], [1, 0, 1, 2]]);
	pieces[color][7] = new Piece(color, [[2,2],[2,2]], [[1, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 1]]);
	pieces[color][8] = new Piece(color, [[2,2,0],[0,2,2]], [[1, 0, 0, 1, 2], [0, 0, 0, 0, 1], [1, 0, 0, 0, 0], [2, 1, 0, 0, 1]]);
	//pentomino
	pieces[color][9] = new Piece(color, [[2],[1],[1],[1],[2]], [[1, 0, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 0, 1]]);
	pieces[color][10] = new Piece(color, [[0,2],[0,1],[0,1],[2,2]], [[2, 1, 0, 1], [2, 0, 0, 0], [2, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 1]]);
	pieces[color][11] = new Piece(color, [[0,2],[0,1],[2,2],[2,0]], [[2, 1, 0, 1], [2, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 1], [1, 0, 1, 2]]);
	pieces[color][12] = new Piece(color, [[0,2],[2,1],[2,2]], [[2, 1, 0, 1], [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 1]]);
	pieces[color][13] = new Piece(color, [[2,2],[0,1],[2,2]], [[1, 0, 0, 1], [0, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 1]]);
	pieces[color][14] = new Piece(color, [[2,0],[1,2],[1,0],[2,0]], [[1, 0, 1, 2], [0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 1], [0, 0, 0, 2], [1, 0, 1, 2]]);
	pieces[color][15] = new Piece(color, [[0,2,0],[0,1,0],[2,1,2]], [[2, 1, 0, 1, 2], [2, 0, 0, 0, 2], [1, 0, 0, 0, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1]]);
	pieces[color][16] = new Piece(color, [[2,0,0],[1,0,0],[2,1,2]], [[1, 0, 1, 2, 2], [0, 0, 0, 2, 2], [0, 0, 0, 0, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1]]);
	pieces[color][17] = new Piece(color, [[2,2,0],[0,2,2],[0,0,2]], [[1, 0, 0, 1, 2], [0, 0, 0, 0, 1], [1, 0, 0, 0, 0], [2, 1, 0, 0, 0], [2, 2, 1, 0, 1]]);
	pieces[color][18] = new Piece(color, [[2,0,0],[2,1,2],[0,0,2]], [[1, 0, 1, 2, 2], [0, 0, 0, 0, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 0], [2, 2, 1, 0, 1]]);
	pieces[color][19] = new Piece(color, [[2,0,0],[2,1,2],[0,2,0]], [[1, 0, 1, 2, 2], [0, 0, 0, 0, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [2, 1, 0, 1, 2]]);
	pieces[color][20] = new Piece(color, [[0,2,0],[2,1,2],[0,2,0]], [[0, 1, 0, 1, 0], [1, 0, 0, 0, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0]]);
}

//TODO: INITIALIZE BOARD
//TODO: INITIALIZE GAME STATE

			
/*
* DRAWING METHODS
*/
//DRAW CANVAS
function drawCanvas(){
	//if state is invalid, definitely redraw and validate
	if (!valid){
		//clear previous canvas
		context.clearRect(0, 0, canvasElem.width, canvasElem.height);
		//draw the board
		drawBoard();
		//draw the moves.
		drawMoves();
		//draw the pieces
		var drawPC = drawPieceContainer();
		Object.keys(colors).map(drawPC);
		//draw the edit pane
		drawEditPane();
		//draw the currentPiece, if it exists
		if (currentPiece!=null){
			//clear edit pane
			context.clearRect(leftMarginOfEditPane + 10 - .5, topMarginOfEditPane + 10 - .5, currentPiece.w + 1, currentPiece.h + 1);
			drawCurrentPiece();
		}
		valid = true;
	}
}
//DRAW BOARD
function drawBoard(){
	context.strokeStyle = '#000000';
	context.lineWidth = 1;
	var x= leftMargin;
	var y= topMargin;
	
	for (var i=0; i < boardSquares; i++){
		for (var j=0; j < boardSquares; j++){
			if (board[i][j] != null){
				context.fillStyle = hexColors[board[i][j]];
				context.fillRect(x + i*boardSquareWidth,y + j*boardSquareWidth,boardSquareWidth,boardSquareWidth);
			}
			context.strokeRect(x + i*boardSquareWidth,y + j*boardSquareWidth,boardSquareWidth,boardSquareWidth);
		}
	}
}

//DRAW MOVES
function drawMoves(){
	//alert(moves);
	context.strokeStyle = '#000000';
	context.lineWidth = 1;
	var x= leftMargin;
	var y= topMargin;
	//alert(moves[0][boardSquares-1]);
	//alert(moves[0][boardSquares-1] / Math.pow(10, colors[currentColor])%10);
	for (var i=0; i < boardSquares; i++){
		for (var j=0; j < boardSquares; j++){
			//if ((moves[i][j] / Math.pow(10, colors[currentColor]))%10 === 1){
			//context.fillStyle = currentColor;
			if (moves[i][j]!=null &&
				moves[i][j][colors[currentColor]] == '1'){
				context.fillStyle = currentColor;
				context.fillRect(x + i*boardSquareWidth,y + j*boardSquareWidth,boardSquareWidth/2,boardSquareWidth/2);
				context.strokeRect(x + i*boardSquareWidth,y + j*boardSquareWidth,boardSquareWidth/2,boardSquareWidth/2);
			}
		}
	}
	
}

//DRAW ONE PIECE (FOR SELECTION) AND SET COORDS
function drawPieces(color, x, y){
	context.strokeStyle = '#000000';
	context.fillStyle = hexColors[color];
	context.lineWidth = 1;
	var x = x;
	var y = y;
	return function(piece){
		var newx = x + pieceWidth*piece.boardRep.length + pieceWidth;
		//start new line of pieces if necessary
		//if (newx > $(canvasElem).attr('width')){
		if (newx > leftMarginOfContainer + containerWidth){
			y += 4*pieceWidth; //no piece is higher than 3 blocks
			x = leftMargin + boardWidth;
		}
		//set piece top-left coordinates
		piece.tlX = x;
		piece.tlY = y;
		//draw piece
		for (var i = 0; i < piece.boardRep.length; i++){
			for (var j = 0; j < piece.boardRep[0].length; j++){
				if (piece.boardRep[i][j] !== 0){
					context.fillRect(x + i*pieceWidth, y + j*pieceWidth, pieceWidth, pieceWidth);
					context.strokeRect(x + i*pieceWidth, y + j*pieceWidth, pieceWidth, pieceWidth);
//					piece.points++;
				}
			}
		}
		//set piece width/height
		piece.w = i*pieceWidth;
		piece.h = j*pieceWidth;
		x += pieceWidth*piece.boardRep.length + pieceWidth;
	};
}

//DRAW SIMPLE CONTAINER FOR EACH COLOR OF PIECE AND SET COORDS
function drawPieceContainer(){
	context.strokeStyle = '#000000';
	context.lineWidth = 1;
	var x= leftMargin + boardWidth;
	var y= topMargin;
	
	return function(color){
		context.strokeRect(x, y, containerWidth, containerHeight);
		containerPos[color] = [x, y]; //set container coords
		var drawP = drawPieces(color, x, y);
		pieces[color].map(drawP);
		y += containerHeight + yMarg;
	};
}

//DRAW PIECE EDITING PANE AND OPTIONS
function drawEditPane(){
	context.strokeStyle = '#000000';
	context.lineWidth = 1;
	
	var x= leftMarginOfEditPane;
	var y= topMarginOfEditPane;
	context.strokeRect(x, y, containerWidth, editPaneHeight);
	
	//OPTIONS
	x += editPaneHeight + 10;
	y += 10;
	
	//ROTATE
	buttons['rotateCW'] = [x, y];
	context.drawImage(rotateCW_button, x, y);
	context.strokeRect(x, y, buttonSize, buttonSize);
	y += buttonSize + 10;
	
	//FLIP HORIZ
	buttons['flipHoriz'] = [x, y];
	context.drawImage(flipHoriz_button, x, y);
	context.strokeRect(x, y, buttonSize, buttonSize);
	y += buttonSize + 10;
	
	//FLIP VERT
	buttons['flipVert'] = [x, y];
	context.drawImage(flipVert_button, x, y);
	context.strokeRect(x, y, buttonSize, buttonSize);
}
//DRAW CURRENT PIECE (FOR EDITING)
function drawCurrentPiece(){
	context.strokeStyle = '#000000';
	context.fillStyle = hexColors[currentColor];
	context.lineWidth = 1;
	var w = boardSquareWidth; //width of one tile
	var x = currentPiece.tlX;
	var y = currentPiece.tlY;
	//clear any previous pieces
	//max width (5w) and height (5w) of any piece (flipped/rotated)
	//accounting for half pixel stroke along the border
	//draw piece
	for (var i = 0; i < currentPiece.boardRep.length; i++){
		for (var j = 0; j < currentPiece.boardRep[0].length; j++){
			if (currentPiece.boardRep[i][j] !== 0){
				context.fillRect(x + i*w, y + j*w, w, w);
				context.strokeRect(x + i*w, y + j*w, w, w);
			}
		}
	}
	//set piece width/height
	currentPiece.w = i*w;
	currentPiece.h = j*w;
}

/*
* DETERMINING POSSIBLE MOVES/PIECES
*/

//CHECK IF A VALID MOVE?
/*is valid if: 1. currentPiece is within bounds of the board
			   2. at least one corner of piece is on a playable square of the color
			   3. entire piece is on fillable squares for the color
			   4. piece does not border other pieces of its own color (this is assumed to be true)
			   */
function isValidMove(){
	var margErr =  boardSquareWidth/2;
	var relX = Math.floor((currentPiece.tlX - leftMargin + margErr) / boardSquareWidth);
	var relY = Math.floor((currentPiece.tlY - topMargin + margErr) / boardSquareWidth);
			
	var withinBounds = (currentPiece.tlX >= leftMargin - margErr &&
			currentPiece.tlX + currentPiece.w <= leftMargin + boardWidth + margErr &&
			currentPiece.tlY >= topMargin - margErr &&
			currentPiece.tlY + currentPiece.h <= topMargin + boardWidth + margErr); //1
	
	var playableSq = false; //2
	var fillableSq = true; //3
	var validBorder = true; //4 - if update moves is executed correctly, this is true
	
	//iterate over all squares in this piece
	if (withinBounds){
		for (var i = 0; i < currentPiece.boardRep.length; i++){
			for (var j = 0; j < currentPiece.boardRep[0].length; j++){
				switch(currentPiece.boardRep[i][j]){
					case 0:	//exterior of piece
						break;
					// case 1 (non-corner interior) = default case
					case 2: //corner of the piece
						if (moves[relX + i][relY + j]!=null){
							playableSq = playableSq ||
								(moves[relX + i][relY + j][colors[currentColor]] == '1');
						//only one TRUE needed
						}
						else{
								playableSq = playableSq || false;
						}
						break;
					default:
						if (moves[relX + i][relY + j]!=null){
							fillableSq = fillableSq && 
								(moves[relX + i][relY + j][colors[currentColor]] == '0');					
							//must all be TRUE
						}
				}
				//end switch
		}} //end nested for loops
	}
	//alert(playableSq);
	//alert(fillableSq);
	return (withinBounds && playableSq && fillableSq && validBorder);
}


//TODO: UPDATE POSSIBLE MOVES ON BOARD
/*
function updateMoves(){
	for (var i = 0; i < currentPiece.boardRep.length; i++){
		for (var j = 0; j < currentPiece.boardRep[0].length; j++){
			if (currentPiece.boardRep[i][j] != 0){
				
			}
		}
	}
}*/

//TODO: UPDATE POSSIBLE PIECES FOR PLAYER

/*
* MOUSE EVENTS
*/
//TODO: MOUSE EVENTS IN CANVAS
//MOUSE CLICK IN CANVAS
function onClickInCanvas(event){
	//location of click within canvas = page coordinate - canvas offset
	var mouseX = (event.pageX - canvasElem.offsetLeft);
	var mouseY = (event.pageY - canvasElem.offsetTop);
	//alert(mouseX + ',' + mouseY);
	
	//USER CLICKS ON PLAYABLE PIECES
	//check if mouseclick is within color area
	var container;
	for (container in containerPos) {
		if( mouseX >= containerPos[container][0] &&
			mouseX <= containerPos[container][0] + containerWidth &&
			mouseY >= containerPos[container][1] &&
			mouseY <= containerPos[container][1] + containerHeight){
				break;
			}
		container = 'none';
	}
	//alert(container===currentColor);
	//check if mouseclick is on a particular piece
	if (container === currentColor){
		var selectedPiece = pieces[container].filter( function(piece){
			return (mouseX >= piece.tlX &&
					mouseX <= piece.tlX + piece.w &&
					mouseY >= piece.tlY &&
					mouseY <= piece.tlY + piece.h);
		})[0];
		//record location in array
		currentPieceID = pieces[container].indexOf(selectedPiece);

		//clear previous piece, if it exists
		if (currentPiece!=null){
			context.clearRect(leftMarginOfEditPane + 10 - .5, topMarginOfEditPane + 10 - .5, currentPiece.w + 1, currentPiece.h + 1);
			}
		
		//deep copy selected piece, place within edit pane
		currentPiece = new Piece(selectedPiece.color, selectedPiece.boardRep.slice(0), selectedPiece.moveRep.slice(0));
		currentPiece.tlX = leftMarginOfEditPane + 10;
		currentPiece.tlY = topMarginOfEditPane + 10;
		
		//clear edit pane and draw currentPiece
		drawCurrentPiece();
		
	}
	//USER CLICKS ON FLIP/ROTATE
	//only works if a piece is currently selected
	//change the representation in the edit pane
	if (currentPiece != null){
		for (var button in buttons) {
			if( mouseX >= buttons[button][0] &&
				mouseX <= buttons[button][0] + buttonSize &&
				mouseY >= buttons[button][1] &&
				mouseY <= buttons[button][1] + buttonSize){
					window[button](currentPiece);
					//clear edit pane
					context.clearRect(leftMarginOfEditPane + 10 - .5, topMarginOfEditPane + 10 - .5, currentPiece.w + 1, currentPiece.h + 1);
					drawCurrentPiece();
					break;
				}
		}
		//alert(button);
	}
}

//MOUSE DOWN ON CURRENT PIECE (IN ANTICIPATION OF DRAG)
function onMouseDownCanvas(event){
	//location of click within canvas = page coordinate - canvas offset
	var mouseX = (event.pageX - canvasElem.offsetLeft);
	var mouseY = (event.pageY - canvasElem.offsetTop);
	
	//if mouse down is on the current piece
	if (mouseX >= currentPiece.tlX &&
		mouseX <= currentPiece.tlX + currentPiece.w &&
		mouseY >= currentPiece.tlY &&
		mouseY <= currentPiece.tlY + currentPiece.h){
		dragoffx = mouseX - currentPiece.tlX;
		dragoffy = mouseY - currentPiece.tlY;
		dragging = true;
		valid = false;
		//alert(dragging);
	}
}

//MOUSE MOVE FOR DRAGGING SELECTED PIECE
function onMouseMoveCanvas(event){
	//location of click within canvas = page coordinate - canvas offset
	var mouseX = (event.pageX - canvasElem.offsetLeft);
	var mouseY = (event.pageY - canvasElem.offsetTop);
	if (dragging){
		//update piece location
		currentPiece.tlX = mouseX - dragoffx;
		currentPiece.tlY = mouseY - dragoffy;
		valid = false;
		//redraw piece
		drawCanvas();
	}
}

//MOUSE UP FOR PLACING PIECE ON BOARD
function onMouseUpCanvas(event){
	//location of click within canvas = page coordinate - canvas offset
	var mouseX = (event.pageX - canvasElem.offsetLeft);
	var mouseY = (event.pageY - canvasElem.offsetTop);
	if (dragging){
		//snap the piece into the board if this is a valid move
		//TODO: check if this is a valid move
		//"snap" top left to nearest grid point within boardSquareWidth/2
		//if(true){
		if(isValidMove()){
			//calculate closest grid square
			var relX = Math.floor((currentPiece.tlX - leftMargin + 0.5*boardSquareWidth) / boardSquareWidth);
			var relY = Math.floor((currentPiece.tlY - topMargin + 0.5*boardSquareWidth) / boardSquareWidth);
			
			//update moves - assumption is that this is a valid play
			for (var i = 0; i < currentPiece.moveRep.length; i++){
			for (var j = 0; j < currentPiece.moveRep[0].length; j++){	
				//alert(currentPiece.moveRep[0][0]);
				//check bounds
				if ((relX-1+i)>=0 && 
					(relY-1+j)>=0 &&
					(relX-1+i)<boardSquares &&
					(relY-1+j)<boardSquares){
				switch(currentPiece.moveRep[i][j]){
					case 0:	//unplayable in the future
						//make unplayable by this color
						//other colors remain unchanged.
						if (moves[relX - 1 + i][relY - 1 + j]== null){
								moves[relX - 1 + i][relY - 1 + j] = '0000';
						}
						moves[relX - 1 + i][relY - 1 + j] =
							moves[relX - 1 + i][relY - 1 + j].substring(0, colors[currentColor]) +
							'2' + moves[relX - 1 + i][relY - 1 + j].substring(colors[currentColor]+1);
						break;
					case 1: //future corner
						//is this square empty?
						//if not filled
						if(board[relX - 1 + i][relY - 1 + j] == null){
							//if square is empty, make it playable by this color.
							if (moves[relX - 1 + i][relY - 1 + j]== null){
								moves[relX - 1 + i][relY - 1 + j] = '0000';
							}
							
							// if this square does not borders this color, make it a playable corner
							if (moves[relX - 1 + i][relY - 1 + j][colors[currentColor]] != '2'){
								moves[relX - 1 + i][relY - 1 + j] =
									moves[relX - 1 + i][relY - 1 + j].substring(0, colors[currentColor]) +
									'1' + moves[relX - 1 + i][relY - 1 + j].substring(colors[currentColor]+1);
							}
							
						
							//alert(moves[relX - 1 + i][relY - 1 + j]);
						}
						//if square is filled, leave as is.
						break;
					//case 2: fillable in the future
					default: //same as case 2, so do nothing
						if (moves[relX - 1 + i][relY - 1 + j]== null){
								moves[relX - 1 + i][relY - 1 + j] = '0000';
						}
				}//end switch
				}//end if
				
				}} //end nested for
			
			//update board and moves
			for (var i = 0; i < currentPiece.boardRep.length; i++){
			for (var j = 0; j < currentPiece.boardRep[0].length; j++){	
				if (currentPiece.boardRep[i][j] != 0){
					moves[relX + i][relY + j] = '2222'
					board[relX + i][relY + j] = currentPiece.color;
					currentPiece.points++;
				}
			}}
			
			//now the player's turn ends when they play a piece
			//execute subsequent commands
			piecePlayed();
		}
		//otherwise, put it back in the edit pane
		else{
			currentPiece.tlX = leftMarginOfEditPane + 10;
			currentPiece.tlY = topMarginOfEditPane + 10;
		}
		dragging = false;
	}
	valid = false;
	drawCanvas();
}

/*
* ROTATE CW, FLIP HORIZ/VERT
*/
//create new 2D array
function get2DArray(dim0, dim1) {
    dim0 = dim0 > 0 ? dim0 : 0;
    var arr = [];
    while(dim0--) {
        arr.push(new Array(dim1));
    }
    return arr;
}


//ROTATE CW
function rotateCW(piece){
	//dimensions
	var dim = [piece.boardRep.length, piece.boardRep[0].length];
	var bTemp = get2DArray(dim[1], dim[0]);
	var mTemp = get2DArray(dim[1]+2, dim[0]+2);
	
	//new boardRep
	for (var i=0; i< dim[0]; i++){
		//for each row
		for (var j=0; j< dim[1]; j++){
			//copy each element to the temp array
			bTemp[dim[1]-j-1][i] = piece.boardRep[i][j];
		}
	}
	
	//new moveRep
	for (var i=0; i< dim[0]+2; i++){
		//for each row
		for (var j=0; j< dim[1]+2; j++){
			//copy each element to the temp array
			mTemp[dim[1]+2-j-1][i] = piece.moveRep[i][j];
		}
	}
		
	//rewrite board and move arrays
	piece.boardRep = bTemp;
	piece.moveRep = mTemp;
}
//FLIP VERT
function flipVert(piece){
	//dimensions
	var dim = [piece.boardRep.length, piece.boardRep[0].length];
	var bTemp = get2DArray(dim[0], dim[1]);
	var mTemp = get2DArray(dim[0]+2, dim[1]+2);	

	//flip board horizontally
	for (var i=0; i < dim[0]; i++){
		//for each row
		for (var j=0; j < dim[1]; j++){
			//copy each element to the temp arrays
			bTemp[i][j] = piece.boardRep[i][dim[1]-1-j];
		}
	}
		
	//flip moves horizontally
	for (var i=0; i < dim[0]+2; i++){
		//for each row
		for (var j=0; j < dim[1]+2; j++){
			//copy each element to the temp arrays
			mTemp[i][j] = piece.moveRep[i][dim[1]+2-1-j];
		}
	}
		
	//rewrite board and move arrays
	piece.boardRep = bTemp;
	piece.moveRep = mTemp;
}
	
//FLIP HORIZ
function flipHoriz(piece){
	//dimensions
	var dim = [piece.boardRep.length, piece.boardRep[0].length];
	var bTemp = get2DArray(dim[0], dim[1]);
	var mTemp = get2DArray(dim[0]+2, dim[1]+2);	
		
	//flip board vertically
	for (var i=0; i<dim[0]; i++){
		//for each row
		//copy to the temp arrays
		bTemp[i] = piece.boardRep[dim[0]-1-i];
	}
	
	//flip moves vertically
	for (var i=0; i<dim[0]+2; i++){
		//for each row
		//copy to the temp arrays
		mTemp[i] = piece.moveRep[dim[0]+2-1-i];
	}
	
	//rewrite board and move arrays
	piece.boardRep = bTemp;
	piece.moveRep = mTemp;
}

/*
* SETUP AND GAMEPLAY SEQUENCE
*/

function resignCurrentPlayer(){
	if (currentPlayers.length == 1){
		//last player to resign
		gameOver = true;
		currentPlayers.splice(0,1);
		$('#currentplayer').text('Game Over');
		$('#currentplayer').css('color', 'black');
		$('#pass').css('display', 'none');
		Object.keys(colors).map(updateFinalScore);
	}
	else{
		//remove currentColor from currentPlayers
		var id = currentPlayers.indexOf(currentColor);
		//get next color
		currentColor = currentPlayers[(id+1)%currentPlayers.length];
		//remove this color
		currentPlayers.splice(id,1);
		//update scoreboard
		$('#currentplayer').text('Current player: ' + currentColor);
		$('#currentplayer').css('color', currentColor);
	}
	//redraw board
	valid = false;
	drawCanvas();
}

//UPDATE SCORE FOR ONE PLAYER
function updateScore(piece){
	//add the points from this piece to the current player's score
	scores[currentColor] += piece.points;
	//alert(piece.points);
	//if this piece is the last one of its color, add 15 pts
	//if the last piece is the monomino, add 5 more.
	if (pieces[currentColor].length === 1){
		scores[currentColor] += 15;
		if(piece.points === 1){
			scores[currentColor] += 5;
		}
	}
	
	//update the score on the page
	$('#'+currentColor+'score').text(currentColor + ": " + scores[currentColor]);
}
//UPDATE FINAL SCORE FOR ONE PLAYER
function updateFinalScore(color){
	//max polyomino squares: 89
	//figure out unused points
	var unusedPoints = 89 - scores[color];
	if (unusedPoints > 0){
		//subtract from current score to get final score
		scores[color] -= unusedPoints;
		$('#'+color+'score').text(color + ": " + scores[color]);
	}
}

//SEQUENCE AFTER PIECE IS PLAYED
function piecePlayed(){
	//update score
	updateScore(currentPiece);
	//remove current piece from player's pieces
	pieces[currentColor].splice(currentPieceID, 1);		
	//clear current piece
	currentPiece = null;
	currentPieceID = -1;
	
	//if no pieces left, remove currentColor from currentPlayers
	if (pieces[currentColor].length == 0){
		var id = currentPlayers.indexOf(currentColor);
		//get next color
		currentColor = currentPlayers[(id+1)%currentPlayers.length];
		//remove this color
		currentPlayers.splice(id,1);
	}
	//TODO: check if player has remaining moves left
		//if none, remove them from currentPlayers
	//if no players left, flag gameOver
	if (currentPlayers.length == 0){
		gameOver = true;
		$('#currentplayer').text('Game Over');
		$('#currentplayer').css('color', 'black');
		$('#pass').css('display', 'none');
		Object.keys(colors).map(updateFinalScore);
	}
	else{
		//change the current color, skipping anyone who is out
		currentColor = currentPlayers[(currentPlayers.indexOf(currentColor)+1)%currentPlayers.length];
		$('#currentplayer').text('Current player: ' + currentColor);
		$('#currentplayer').css('color', currentColor);
	}
}

//check for compatibility
if (canvasElem && canvasElem.getContext){
	//get 2d context
	context = canvasElem.getContext('2d');
	if(context){
		//INITIALIZE BOARD, PIECES, GAME STATE
		Object.keys(colors).map(initPieces);
		//DRAW THE CANVAS
		drawCanvas();
		
		//SET UP SCOREBOARD
		$('#currentplayer').text('Current player: ' + currentColor);
		$('#currentplayer').css('color', currentColor);
		$('#redscore').text('red' + ": " + 0);
		$('#yellowscore').text('yellow' + ": " + 0);
		$('#greenscore').text('green' + ": " + 0);
		$('#bluescore').text('blue' + ": " + 0);
		
		//SET UP USER INTERACTION
		canvasElem.addEventListener("click", function(event){onClickInCanvas(event);});
		canvasElem.addEventListener("mousedown", function(event){onMouseDownCanvas(event);});
		canvasElem.addEventListener("mouseup", function(event){onMouseUpCanvas(event);});
		canvasElem.addEventListener("mousemove", function(event){onMouseMoveCanvas(event);});

		//GAME PLAY LOOP
			
		//GAME END SEQUENCE
		//update final score for all players
	}

}