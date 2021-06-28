import React from "react"
import ReactDOM from "react-dom"
import PropTypes from "prop-types"

//クラスコンポーネントだとうまくいかなかった。。。多分, setStateとか使わないと更新されないみたいな話だと思うけど, 今は動くのを優先で後回し。
// class Cell extends React.Component{
//     class = "cell ";
//     constructor(props){
//         super();
//         this.class += props.class;
//     }

//     render(){
//         let res = <div className = {this.class}> </div>;
//         return res
//     }
// }

function Cell(props){
    return <div className = {"cell " + props.class}> </div>;
}


class Tetris{
    now_mino = ""
    next_array = []
    mino_array = ["I","O","Z","S","J","L","T"]
    hold = ""
    holdable = true

    deleting = false //ラインを消した時に, 1秒くらい操作不能にする. エフェクトを加えたりするので. 

    GRID_WIDTH = 10;
    GRID_HEIGHT = 20;
    grid_info = []
    
    active_mino_position_x = 0 //操作対象のミノのx座標(左上)
    active_mino_position_y = 0 //操作対象のミノのy座標(左上)
    active_mino_rotate_status = 0 //回転の状態 [0,3]の整数

    active_mino_type = ""
    active_mino_size = 0 //Iミノなら4, それ以外なら3. 回転の時につかう情報.

    mino_shapes = {
        "O":[[0,0], [0,1], [1,0], [1,1]],
        "T":[[0,1], [1,0], [1,1], [1,2]],
        "Z":[[0,1], [0,2], [1,0], [1,1]],
        "S":[[0,0], [0,1], [1,1], [1,2]],
        "L":[[0,2], [1,0], [1,1], [1,2]],
        "J":[[0,0], [1,0], [1,1], [1,2]],
        "I":[[1,0], [1,1], [1,2], [1,3]]
    }
    
    constructor(){

        this.lengthen_next_array()
        console.log(this.next_array)
        console.log(this.active_mino_type)

        this.init_grid_info()
        this.update_mino()
        


        
        // next_array = this.shuffled_mino_array();
    }


    //NEXTの配列を1巡分長くする
    lengthen_next_array(){
        this.shuffle_mino_array()

        console.log("[before] next_array")
        console.log(this.next_array)
        this.next_array = this.next_array.concat( this.mino_array )
        console.log("[after] next_array")
        console.log(this.next_array)
    }
    
    //minoのシャッフル(NEXT用)
    shuffle_mino_array(){
        for(let idx1=this.mino_array.length-1; idx1>0; idx1--){
            let idx2 = Math.floor( Math.random(idx1) * (idx1+1) );
            [this.mino_array[idx1], this.mino_array[idx2]] = [this.mino_array[idx2], this.mino_array[idx1]]
        }
    }


    //grid_infoの初期化
    init_grid_info(){
        for(let h=0; h<this.GRID_HEIGHT; h++){
            let row = [];
            for(let w=0; w<this.GRID_WIDTH; w++){
                if(w < 4){
                    row.push("empty");
                }else{
                    row.push("full");
                }
            }
            this.grid_info.push(row);
        }
    }

    
    //ミノの形(座標)を取得
    get_mino_shape(){
        if(this.active_mino_rotate_status == 0){ //そのまま
            return this.mino_shapes[this.active_mino_type]
        }else if(this.active_mino_rotate_status == 1){ //1度右に回転
            return this.mino_shapes[this.active_mino_type].map(([y,x])=>{
                return [x, this.active_mino_size - 1 - y]
            })
        }else if(this.active_mino_rotate_status == 2){ //2度右に回転
            return this.mino_shapes[this.active_mino_type].map(([y,x])=>{
                return [this.active_mino_size - 1 - y, this.active_mino_size - 1 - x]
            })
        }else{ //1度左に回転
            return this.mino_shapes[this.active_mino_type].map(([y,x])=>{
                return [this.active_mino_size - 1 - x, y]
            })
        }
    }
    

    hold(){
        
    }

    //操作するミノを更新する
    update_mino(){
        this.active_mino_position_x = 0 
        this.active_mino_position_y = 0 
        this.active_mino_rotate_status = 0 

        
        
        if(this.next_array.length < 4){
            this.lengthen_next_array()   
        }


        this.active_mino_type = this.next_array.shift()
        if(this.active_mino_type=="I"){
            this.active_mino_size = 4
        }else{
            this.active_mino_size = 3
        }
        this.add_mino_to_grid()
        
    }


    //操作対象のミノをgrid_infoに追加
    add_mino_to_grid(){
        this.get_mino_shape().map( ([dy,dx]) =>{
            let y = this.active_mino_position_y + dy;
            let x = this.active_mino_position_x + dx;
            this.grid_info[y][x] = this.active_mino_type
        })
    }

    //操作対象のミノをgrid_infoから削除
    remove_mino_from_grid(){
        this.get_mino_shape().map( ([dy,dx]) =>{
            let y = this.active_mino_position_y + dy;
            let x = this.active_mino_position_x + dx;
            this.grid_info[y][x] = "empty"
        })
    }

    //ミノ同士(あるいは壁との)衝突を検出
    is_conflicting(){
        let conflicting = false;
        this.get_mino_shape().find( ([dy,dx]) =>{
            let y = this.active_mino_position_y + dy;
            let x = this.active_mino_position_x + dx;
            if(!this.is_inside(y,x) || this.grid_info[y][x] != "empty"){
                conflicting = true;
            }
        })
        return conflicting;
    }

    //操作対象のミノが盤面の中にあるか
    is_inside(y,x){
        return 0<=y && y<this.GRID_HEIGHT && 0<=x && x<this.GRID_WIDTH;
    }


    //左回転
    spin_left(){
        this.remove_mino_from_grid();
        console.log(this.active_mino_rotate_status)
        this.active_mino_rotate_status = (this.active_mino_rotate_status + 4 - 1) % 4;
        if(this.is_conflicting()){
            this.active_mino_rotate_status = (this.active_mino_rotate_status + 1) % 4
        }
        console.log(this.active_mino_rotate_status)
        this.add_mino_to_grid();
    }

    //右回転
    spin_right(){
        this.remove_mino_from_grid();
        this.active_mino_rotate_status = (this.active_mino_rotate_status + 1) % 4;
        if(this.is_conflicting()){
            this.active_mino_rotate_status = (this.active_mino_rotate_status + 4 - 1) % 4;
        }
        this.add_mino_to_grid();
    }

    //1マス左に動かす
    move_left(){
        this.remove_mino_from_grid() 

        this.active_mino_position_x --
        if(this.is_conflicting()){
            this.active_mino_position_x ++
        }
        this.add_mino_to_grid()
     
        console.log(this.active_mino_position_x)
    }

    //1マス右に動かす
    move_right(){
        this.remove_mino_from_grid() 

        this.active_mino_position_x ++
        if(this.is_conflicting()){
            this.active_mino_position_x --
        }
        this.add_mino_to_grid()
     
        console.log(this.active_mino_position_x)
    }

    //1マス下に動かす
    move_down(){
        this.remove_mino_from_grid() 

        this.active_mino_position_y ++
        if(this.is_conflicting()){
            this.active_mino_position_y --
        }
        this.add_mino_to_grid()

        console.log(this.active_mino_position_y)
    }

    //下まで瞬時に下ろす
    hard_drop(){
        this.remove_mino_from_grid() 

        let max_y = this.active_mino_position_y

        while(++this.active_mino_position_y < this.GRID_HEIGHT){
            if(this.is_conflicting()){
                break;
            }
            max_y = this.active_mino_position_y;
        }

        this.active_mino_position_y = max_y;
        
        this.add_mino_to_grid();
        this.drop()

    }

    //ミノをドロップ(確定)
    drop(){
        //もしラインが消えなかったらゲームオーバー
        //ラインが消えたら, 描画する. 
        //ラインを消す処理もする
        //ラインが消える描画をしたら,  そのあとupdate_minoで操作するミノを更新する.
        this.update_mino()
    }
    
    get_key(h,w){
        return h.toString() + w.toString() + this.grid_info[h][w];
    }
}








let active = false; //ミノを動かしてる間, 他の入力を受け付けない
let tetris = new Tetris();



let cnt = 0
let render_grid = function(){
    let dom = document.getElementById('grid');
    let el=(
        <div className="grid-wrapper" key={cnt}>
            {
                tetris.grid_info.map((row,idx1)=>{
                    return(
                        <div className="row" key={idx1.toString() + " "}>
                            {
                                row.map((cell_info,idx2)=>{
                                    return (
                                        <React.Fragment key={tetris.get_key(idx1, idx2)}>
                                            <Cell class={cell_info}/>
                                        </React.Fragment>
                                    )
                                })
                            }
                        </div>
                    )
                })
            }
        </div>
    );
    console.log(el)
    ReactDOM.render(el, dom);
}




//初期描画
render_grid();



//テトリスの操作
document.onkeydown = event =>{
    const A_code = 65;
    const D_code = 68;

    const left_code = 37;
    const up_code = 38;
    const right_code = 39;
    const down_code = 40;

    if( [A_code, D_code, left_code, up_code, right_code, down_code].includes(event.keyCode) ){
        console.log(event.keyCode)
        if(down_code == event.keyCode){
            tetris.move_down();
        }else if(left_code == event.keyCode){
            tetris.move_left();
        }else if(right_code == event.keyCode){
            tetris.move_right();
        }else if(up_code == event.keyCode) {
            tetris.hard_drop();
        }else if(A_code == event.keyCode){
            tetris.spin_left();
        }else if(D_code == event.keyCode){
            tetris.spin_right();
        }
        render_grid();
    }
};