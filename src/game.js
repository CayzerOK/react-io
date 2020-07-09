import * as React from "react";
import "./game.css";
import openSocket from 'socket.io-client';

const url = window.location.hostname;

class Game extends React.Component{

    constructor(props) {
        super(props);

        this.state = {
            my_turn: false,
            symbol: "x",
            board: {
                r0c0: "",
                r0c1: "",
                r0c2: "",
                r1c0: "",
                r1c1: "",
                r1c2: "",
                r2c0: "",
                r2c1: "",
                r2c2: ""
            },
            message: "Waiting for opponent...",
            middle_cell : "game_cell middle",
            cell: "game_cell"
        }
    }

    componentDidMount() {
        let root = this;
        root.socket = openSocket(url+":8000");

        root.socket.on("game.begin", function(data) {
            console.log("BEGIN!")
            root.setState(state => {
                state.my_turn = data.symbol === "X";
                state.symbol = data.symbol;
                return state;
            });
            root.renderTurnMessage();
        });

        root.socket.on("opponent.left", function() {
            root.setState(state => {
                state.message = "Your opponent burst into tears and left.";
                return state;
            });
        });

        root.socket.on("move.made", function(data) {
            let isNeedRender = false;
            root.setState(state => {
                state.board[data.position] = data.symbol;
                state.my_turn = data.symbol !== state.symbol;

                if (!root.isGameOver()) {
                    isNeedRender = true;
                } else {
                    if(state.my_turn) {
                        state.message = "You lost..."
                    } else {
                        state.message = "You won!!!"
                    }
                    state.my_turn = false;
                }
                return state;
            });
            if (isNeedRender) {
                root.renderTurnMessage();
            }
        });
    }

    renderTurnMessage() {
        this.setState(state => {
            if (state.my_turn) {
                state.message = "It's YOUR turn!"
            } else {
                state.message = "Wait for your turn..."
            }

            return state;
        });
    }

    isGameOver() {
        let state = this.state.board;
        let matches = ["XXX", "OOO"];

        let rows = [
            state.r0c0 + state.r0c1 + state.r0c2, // 1st line
            state.r1c0 + state.r1c1 + state.r1c2, // 2nd line
            state.r2c0 + state.r2c1 + state.r2c2, // 3rd line
            state.r0c0 + state.r1c0 + state.r2c0, // 1st column
            state.r0c1 + state.r1c1 + state.r2c1, // 2nd column
            state.r0c2 + state.r1c2 + state.r2c2, // 3rd column
            state.r0c0 + state.r1c1 + state.r2c2, // Primary diagonal
            state.r0c2 + state.r1c1 + state.r2c0  // Secondary diagonal
        ];

        for (let i = 0; i < rows.length; i++) {
            if (rows[i] === matches[0] || rows[i] === matches[1]) {
                return true;
            }
        }

        return false;
    }

    makeMove(target, instance) {
        console.log(target);
        if (!this.state.my_turn) {
            return;
        }
        if (!this.state.board[target]) {
            console.log("chanhed!")
            this.setState(state => {
                state["board"][target] = this.state.symbol;
                return state;
            });
            this.socket.emit("make.move", {
                symbol: this.state.symbol,
                position: target
            });
        }
    }


    render() {
        return (
            <div className='content'>
                <div className='wrapper'>
                    <div className="game_board">
                        <div className="row">
                            <div className={"game_cell"} onClick={this.makeMove.bind(this, "r0c0")}>{this.state.board["r0c0"]}</div>
                            <div className="game_cell middle" onClick={this.makeMove.bind(this, "r0c1")}>{this.state.board["r0c1"]}</div>
                            <div className="game_cell" onClick={this.makeMove.bind(this, "r0c2")}>{this.state.board["r0c2"]}</div>
                        </div>
                        <div className="row middlerow">
                            <div className="game_cell" onClick={this.makeMove.bind(this, "r1c0")}>{this.state.board["r1c0"]}</div>
                            <div className="game_cell middle" onClick={this.makeMove.bind(this, "r1c1")}>{this.state.board["r1c1"]}</div>
                            <div className="game_cell" onClick={this.makeMove.bind(this, "r1c2")}>{this.state.board["r1c2"]}</div>
                        </div>
                        <div className="row">
                            <div className="game_cell" onClick={this.makeMove.bind(this, "r2c0")}>{this.state.board["r2c0"]}</div>
                            <div className="game_cell middle" onClick={this.makeMove.bind(this, "r2c1")}>{this.state.board["r2c1"]}</div>
                            <div className="game_cell" onClick={this.makeMove.bind(this, "r2c2")}>{this.state.board["r2c2"]}</div>
                        </div>
                    </div>
                </div>
                <div className='wrapper'>
                    <div className='info'>{this.state.message}</div>
                </div>
            </div>
        );
    }
}

export default Game;
