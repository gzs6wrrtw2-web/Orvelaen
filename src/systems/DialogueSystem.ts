import Phaser from 'phaser';

export class DialogueSystem {
  private panel?: Phaser.GameObjects.Container;
  private active = false;

  constructor(private scene: Phaser.Scene) {}

  show(speaker: string, message: string, onClose?: () => void) {
    if (this.active) return;
    this.active = true;

    const { width, height } = this.scene.scale;
    const box = this.scene.add.rectangle(width / 2, height - 82, Math.min(width - 32, 720), 112, 0x101820, 0.96)
      .setStrokeStyle(3, 0xc7a96b);
    const title = this.scene.add.text(width / 2 - Math.min(width - 32, 720) / 2 + 18, height - 128, speaker, {
      fontFamily: 'monospace', fontSize: '16px', color: '#f5d58a', fontStyle: 'bold'
    });
    const body = this.scene.add.text(width / 2 - Math.min(width - 32, 720) / 2 + 18, height - 101, message, {
      fontFamily: 'monospace', fontSize: '13px', color: '#ffffff',
      wordWrap: { width: Math.min(width - 80, 660) }, lineSpacing: 5
    });
    const hint = this.scene.add.text(width / 2 + Math.min(width - 32, 720) / 2 - 18, height - 43, 'ESPACE / ENTRÉE  ›', {
      fontFamily: 'monospace', fontSize: '10px', color: '#d8c49a'
    }).setOrigin(1, 0.5);
    this.panel = this.scene.add.container(0, 0, [box, title, body, hint]).setDepth(1000);

    const close = () => {
      if (!this.active) return;
      this.active = false;
      this.panel?.destroy();
      this.panel = undefined;
      this.scene.input.keyboard?.off('keydown-SPACE', close);
      this.scene.input.keyboard?.off('keydown-ENTER', close);
      onClose?.();
    };
    this.scene.input.keyboard?.once('keydown-SPACE', close);
    this.scene.input.keyboard?.once('keydown-ENTER', close);
    this.scene.input.once('pointerdown', close);
  }

  get isOpen() { return this.active; }
}
