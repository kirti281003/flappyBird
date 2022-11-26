import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {

  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.image('sky', 'assets/sky1.png');
    this.load.image('bird', 'assets/bird1.png');
    this.load.image('pipe', 'assets/pipe.png');
    this.load.image('pause', 'assets/pause.png');       
    this.load.image('back', 'assets/back.png');
    this.load.image('burger','assets/burger.png');
    this.load.image('grass','assets/grass.png');
  }

  create() {
    this.scene.start('MenuScene');
  }
}

export default PreloadScene;