import BaseScene from "./BaseScene";

const PIPES_TO_RENDER = 10;
var intialBirdSize=1;


class PlayScene extends BaseScene {
  constructor(config) {
    super('PlayScene',config);
   
    this.bird = null;
    this.pipes = null;
    this.burgers=null;
    this.grasses=null;
    this.pipeHorizontalDistance = 0;
    this.flapVelocity = 300;

    this.score = 0;
    this.scoreText = '';
    this.currentDifficulty = 'easy';
    this.difficulties = {
      'easy': {
        pipeHorizontalDistanceRange: [400, 450],
        pipeVerticalDistanceRange: [200, 250]
      },
      'normal': {
        pipeHorizontalDistanceRange: [280, 330],
        pipeVerticalDistanceRange: [140, 190]
      },
      'hard': {
        pipeHorizontalDistanceRange: [250, 310],
        pipeVerticalDistanceRange: [120, 150]
      }
    }
  }

  create() {
    this.currentDifficulty = 'easy';
    super.create();
    this.createBird();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createPause();
    this.handleInputs();
    this.listenToEvents();
    this.createBurgerColliders();
    this.createGrassColliders();
    
   


    this.bird.play('fly');
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
    this.recycleBurgers();
    this.recycleGrasses();
    this.checkgrass();
    this.checkburger();
  }
  listenToEvents()
  {if(this.pauseEvent){return;}
    this.pauseEvent=this.events.on('resume',()=>
    {this.initialTime=3;
      this.countDownText=this.add.text(...this.screenCenter,'Fly in:'+this.initialTime,this.fontOptions).setOrigin(0.5);
      this.timedEvent=this.time.addEvent({
        delay:1000,
        callback:this.countDown,
        callbackScope: this,
        loop: true
      })
    })
  }
  countDown() {
    this.initialTime--;
    this.countDownText.setText('Fly in: ' + this.initialTime);
    if (this.initialTime <= 0) {
      this.countDownText.setText('');
      this.physics.resume();
      this.timedEvent.remove();
    }
  }
  createBG() {
    this.add.image(0, 0, 'sky').setOrigin(0);
  }
  createBird() {
    this.bird = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird').setOrigin(0).setScale(intialBirdSize);
    this.bird.body.gravity.y = 600;
    this.bird.setCollideWorldBounds(true);
  }
  createPipes() {
    this.pipes = this.physics.add.group();
    this.burgers=this.physics.add.group();
    this.grasses=this.physics.add.group();
    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes.create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 1);
      const lowerPipe = this.pipes.create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 0);
      const burger=this.burgers.create(0,0,'burger')
      .setImmovable(true)
      .setOrigin(0,0)
      .setScale(0.35);
      const grass=this.grasses.create(0,0,'grass')
      .setImmovable(true)
      .setOrigin(0,0)
      .setScale(0.35);
      this.placePipe(upperPipe, lowerPipe);
      this.placeBurger(burger);
      this.placeGrass(grass);
    }
    this.pipes.setVelocityX(-200);
    this.burgers.setVelocityX(-200);
    this.grasses.setVelocityX(-200);
  }
  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }

  createBurgerColliders() {
    this.physics.add.collider(this.bird, this.burgers, this.sizeIncrease, null, this);
  }
  createGrassColliders() {
    this.physics.add.collider(this.bird, this.grasses, this.sizeDecrease, null, this);
  }

    
  
  sizeIncrease()
  {intialBirdSize+=0.05;
    this.bird.setScale(intialBirdSize);
    this.physics.resume();
  }
  sizeDecrease()
  {intialBirdSize-=0.05;
    this.bird.setScale(intialBirdSize);
    this.physics.resume();
  }
  checkgrass()
  {   this.grasses.getChildren().forEach(grass=>{
    if(this.bird.getBounds().right>grass.getBounds().right+5)
    {
      grass.setVelocityX(-400);
    }

  });

  }
  checkburger()
  {
    this.burgers.getChildren().forEach(burger=>{
      if(this.bird.getBounds().right>burger.getBounds().right+5)
      {
        burger.setVelocityX(-400);
      }

    });
  }

  createScore() {
    this.score = 0;
    const bestScore = localStorage.getItem('bestScore');
    this.scoreText = this.add.text(16, 16, `Score: ${0}`, { fontSize: '32px', fill: '#000'});
    this.add.text(16, 52, `Best score: ${bestScore || 0}`, { fontSize: '18px', fill: '#000'});
  }
  createPause() {
    const pauseButton=this.add.image(this.config.width - 10, this.config.height -10, 'pause')
    .setInteractive()
      .setScale(3)
      .setOrigin(1)
      pauseButton.on('pointerdown',() =>
      {this.physics.pause();
        this.scene.pause();
        this.scene.launch('PauseScene');

      })
  }
  handleInputs() {
    this.input.on('pointerdown', this.flap, this);
    this.input.keyboard.on('keydown_SPACE', this.flap, this);
  }
  checkGameStatus() {
    if (this.bird.getBounds().bottom >= this.config.height || this.bird.y <= 0) {
      this.gameOver();
    }
  }
  placePipe(uPipe, lPipe) {
    const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();
    const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange);
    const pipeVerticalPosition = Phaser.Math.Between(0 + 20, this.config.height - 20 - pipeVerticalDistance);
    const pipeHorizontalDistance = Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange);
    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;
    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance;
    
    
  }
  placeBurger(b1)
  { const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();
    const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange);
    const burgerHorizontalDistance=Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange+300);
    const burgerVerticalDistance=Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange+30);
    const burgerVerticalPosition=Phaser.Math.Between(0+50,this.config.height-20-burgerVerticalDistance);
    b1.x=burgerHorizontalDistance+rightMostX+100;
    b1.y=burgerVerticalPosition-30;

  }
  placeGrass(g1)
  { const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();
    const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange);
    const GrassHorizontalDistance=Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange+300);
    const GrassVerticalDistance=Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange+30);
    const GrassVerticalPosition=Phaser.Math.Between(0+50,this.config.height-30-GrassVerticalDistance);
    g1.x=GrassHorizontalDistance+rightMostX+150;
    g1.y=GrassVerticalPosition-10;

  }
 recyclePipes() {
    const tempPipes = [];
    
    this.pipes.getChildren().forEach(pipe => {
      if (pipe.getBounds().right <= 0) {
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipe(...tempPipes);
          this.increaseScore();
          this.saveBestScore();
          this.increaseDifficulty();
        }
      }
    })
  }
  recycleBurgers() {
    const tempBurgers= [];
    this.burgers.getChildren().forEach(burger => {
      if (burger.getBounds().right <= 0) {
        tempBurgers.push(burger);
        if (tempBurgers.length === 1) {
          this.placeBurger(...tempBurgers);
        }
      }
    })
  }
  recycleGrasses() {
    const tempGrasses= [];
    this.grasses.getChildren().forEach(grass => {
      if (grass.getBounds().right <= 0) {
        tempGrasses.push(grass);
        if (tempGrasses.length === 1) {
          this.placeGrass(...tempGrasses);
        }
      }
    })
  }

  getRightMostPipe() {
    let rightMostX = 0;
    this.pipes.getChildren().forEach(function(pipe) {
      rightMostX = Math.max(pipe.x, rightMostX);
    })
    return rightMostX;
  }
  gameOver() {
    this.physics.pause();
    this.saveBestScore();

    this.bird.setTint(0xEE4824);
    this.time.addEvent({
      delay: 3000,
      callback: () => {
        intialBirdSize=1;
        this.bird.setScale(intialBirdSize);
        this.scene.restart();
      },
      loop: false
    })
  }
  flap() {
    this.bird.body.velocity.y = -this.flapVelocity;
  }

  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`)
  }

saveBestScore() {
  const bestScoreText = localStorage.getItem('bestScore');
  const bestScore = bestScoreText && parseInt(bestScoreText, 10);

  if (!bestScore || this.score > bestScore) {
    localStorage.setItem('bestScore', this.score);
  }
}
increaseDifficulty() {
  if (this.score === 1) {
    this.currentDifficulty = 'normal';
  }

  if (this.score === 3) {
    this.currentDifficulty = 'hard';
  }
}

}
export default PlayScene;