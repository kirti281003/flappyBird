import Phaser from "phaser";
const config={
  type: Phaser.AUTO,
  width:2800,
  height:600,
  physics:{
    default:'arcade',
    arcade:{        
    }
  },
  scene:{
    preload:preload,
    create:create,
    update:update
  
  }
}
let initialBirdPosition={
  x:config.width*0.1,
  y:config.height/2
}
let bird=null;
let pipes=null;

const pipes_to_render=4;

let pipeVerticalDistanceRange=[150,250];
let pipeHorizontalDistanceRange=[500,550];

let pipeHorizontalDistance=0;
let flapVelocity=300;
function preload()
{
this.load.image('sky','assets/sky.png');
this.load.image('bird','assets/bird.png');
this.load.image('pipe', 'assets/pipe.png');

}



function create()
{this.add.image(0,0,'sky').setOrigin(0,0);
bird=this.physics.add.sprite(config.width*0.1,config.height/2,'bird').setOrigin(0);
bird.body.gravity.y=400;
pipes=this.physics.add.group();
for(let i=0;i<pipes_to_render;i++){

const upperPipe = pipes.create(0, 0, 'pipe').setOrigin(0, 1);         
const lowerPipe = pipes.create(0, 0, 'pipe').setOrigin(0, 0);
placePipe(upperPipe,lowerPipe);

}pipes.setVelocityX(-200);

this.input.on('pointerdown',flap);
this.input.keyboard.on("keydown_SPACE",flap);


}

function update(time,delta){
if(bird.y>config.height||bird.y<0-bird.height)
{window.alert("You lose");
  restartGame();
}
recyclePipes();
}
function placePipe(upipe,lpipe)
{ const rightMostX = getRightMostPipe();
  let pipeVerticalDistance=Phaser.Math.Between(pipeVerticalDistanceRange[0],pipeVerticalDistanceRange[1]);
  let pipeVerticalPosition=Phaser.Math.Between(0+20,config.height-20-pipeVerticalDistance);
  const pipeHorizontalDistance = Phaser.Math.Between(...pipeHorizontalDistanceRange);
  upipe.x=rightMostX+pipeHorizontalDistance;
  upipe.y=pipeVerticalPosition;
  lpipe.x=upipe.x;
  lpipe.y=upipe.y+pipeVerticalDistance;



}
function restartGame()
{
bird.x=initialBirdPosition.x;
bird.y=initialBirdPosition.y;
bird.body.velocity.y=0;
}
function flap()
{
  bird.body.velocity.y=-flapVelocity;
}
function getRightMostPipe()
{
  let rightMostX = 0;

  pipes.getChildren().forEach(function(pipe) {
    rightMostX = Math.max(pipe.x, rightMostX);
  })

  return rightMostX;
}
function recyclePipes()
{
  const tempPipes = [];
  pipes.getChildren().forEach(pipe => {
    if (pipe.getBounds().right <= 0) {
      tempPipes.push(pipe);
      if (tempPipes.length === 2) {
        placePipe(...tempPipes);
      }
    }
  })
}
new Phaser.Game(config);