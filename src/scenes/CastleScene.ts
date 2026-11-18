import Phaser from 'phaser';
import { DialogueSystem } from '../systems/DialogueSystem';

type Interactable = { x: number; y: number; radius: number; label: string; action: () => void };

export class CastleScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private dialogue!: DialogueSystem;
  private interactables: Interactable[] = [];
  private prompt!: Phaser.GameObjects.Text;
  private status!: Phaser.GameObjects.Text;
  private missionStarted = false;
  private touchVector = { x: 0, y: 0 };
  private touchActive = false;

  constructor() { super('CastleScene'); }

  create() {
    this.dialogue = new DialogueSystem(this);
    this.drawCourtyard();
    this.createPlayer();
    this.createCharactersAndInteractions();
    this.createHud();
    this.setupInput();
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBounds(0, 0, 1500, 1000);
    this.physics.world.setBounds(0, 0, 1500, 1000);
    this.add.text(750, 38, 'CHÂTEAU DE KANANN', {
      fontFamily: 'monospace', fontSize: '18px', color: '#f2d99b',
      stroke: '#241b13', strokeThickness: 5
    }).setOrigin(0.5).setDepth(20);
    this.add.text(750, 64, 'COUR INTÉRIEURE', {
      fontFamily: 'monospace', fontSize: '10px', color: '#e5dfc9',
      stroke: '#241b13', strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);
    this.scale.on('resize', this.layoutHud, this);
    this.showIntro();
  }

  private drawCourtyard() {
    const g = this.add.graphics();
    // Herbe de fond et pavés centraux
    g.fillStyle(0x496b43).fillRect(0, 0, 1500, 1000);
    g.fillStyle(0x6b6c61).fillRect(250, 190, 1000, 620);
    g.fillStyle(0x858274).fillRect(275, 215, 950, 570);
    g.lineStyle(3, 0x4b5148, 0.8);
    for (let x = 300; x < 1220; x += 48) {
      g.lineBetween(x, 220, x, 780);
    }
    for (let y = 245; y < 780; y += 42) g.lineBetween(280, y, 1220, y);

    // Château et ailes
    this.drawBuilding(500, 80, 500, 180, 0x777b82, 'GRANDE SALLE');
    this.drawBuilding(120, 170, 160, 480, 0x666e78, 'TOUR OUEST');
    this.drawBuilding(1220, 170, 160, 480, 0x666e78, 'TOUR EST');
    this.drawBuilding(550, 820, 400, 115, 0x70777b, 'ÉCURIES');
    // Porte principale et chemin
    g.fillStyle(0x4a3929).fillRect(690, 175, 120, 90);
    g.fillStyle(0x9c7449).fillRect(715, 185, 70, 80);
    g.fillStyle(0x4a3929).fillRect(700, 780, 100, 220);
    // Jardins
    this.drawTree(370, 330); this.drawTree(1130, 330);
    this.drawTree(370, 680); this.drawTree(1130, 680);
    this.drawTree(470, 740); this.drawTree(1030, 740);
    // Puits
    g.fillStyle(0x4c5559).fillCircle(750, 490, 42);
    g.fillStyle(0x9a9a8b).fillCircle(750, 490, 32);
    g.fillStyle(0x284e59).fillCircle(750, 490, 23);
    g.lineStyle(5, 0x59452f).strokeCircle(750, 490, 42);
    // Bannières
    g.fillStyle(0x8e2e2c).fillRect(645, 185, 24, 72);
    g.fillStyle(0xd8bd72).fillTriangle(645, 255, 669, 255, 657, 273);
    g.fillStyle(0x8e2e2c).fillRect(831, 185, 24, 72);
    g.fillStyle(0xd8bd72).fillTriangle(831, 255, 855, 255, 843, 273);
    // Bordures herbe / chemin
    g.lineStyle(8, 0x344c32).strokeRect(8, 8, 1484, 984);
    // Décor extérieur
    for (let i = 0; i < 26; i++) {
      const x = 45 + (i * 137) % 1410;
      const y = 40 + (i * 83) % 900;
      if (x < 245 || x > 1255 || y < 180 || y > 820) this.drawSmallBush(x, y);
    }
  }

  private drawBuilding(x: number, y: number, w: number, h: number, color: number, label: string) {
    const g = this.add.graphics();
    g.fillStyle(0x28313a, 0.55).fillRect(x + 10, y + 12, w, h);
    g.fillStyle(color).fillRect(x, y, w, h);
    g.fillStyle(0x96999a).fillRect(x + 10, y + 10, w - 20, 12);
    g.fillStyle(0x424b54).fillRect(x + 20, y + h - 35, w - 40, 22);
    g.lineStyle(4, 0x424b54).strokeRect(x, y, w, h);
    for (let wx = x + 35; wx < x + w - 20; wx += 75) {
      g.fillStyle(0x243c4a).fillRect(wx, y + 45, 22, 34);
      g.fillStyle(0xc0a56c).fillRect(wx + 8, y + 45, 5, 34);
    }
    this.add.text(x + w / 2, y + h / 2, label, {
      fontFamily: 'monospace', fontSize: '11px', color: '#f0e4c4',
      backgroundColor: '#29323acc', padding: { x: 5, y: 3 }
    }).setOrigin(0.5).setDepth(5);
  }

  private drawTree(x: number, y: number) {
    const g = this.add.graphics();
    g.fillStyle(0x493522).fillRect(x - 7, y + 8, 14, 30);
    g.fillStyle(0x24472f).fillCircle(x, y, 29);
    g.fillStyle(0x35623a).fillCircle(x - 13, y - 9, 18);
    g.fillStyle(0x477b43).fillCircle(x + 10, y - 13, 16);
    g.lineStyle(2, 0x1e3927).strokeCircle(x, y, 29);
  }

  private drawSmallBush(x: number, y: number) {
    const g = this.add.graphics();
    g.fillStyle(0x294a2e).fillEllipse(x, y, 32, 20);
    g.fillStyle(0x477844).fillEllipse(x - 5, y - 5, 20, 14);
  }

  private createPlayer() {
    const shadow = this.add.ellipse(0, 15, 24, 10, 0x172017, 0.45);
    const cape = this.add.rectangle(0, 1, 17, 23, 0x762e2b).setStrokeStyle(2, 0x3b211f);
    const body = this.add.rectangle(0, 0, 19, 23, 0x687987).setStrokeStyle(2, 0x29343b);
    const head = this.add.circle(0, -16, 8, 0xc99b72).setStrokeStyle(2, 0x533c30);
    const hair = this.add.rectangle(0, -22, 15, 5, 0x493629);
    const belt = this.add.rectangle(0, 7, 19, 4, 0xb89a56);
    const sword = this.add.rectangle(14, -1, 4, 22, 0xd9dce0).setStrokeStyle(1, 0x59636c);
    this.player = this.add.container(750, 610, [shadow, cape, body, head, hair, belt, sword]).setDepth(50);
    this.playerBody = this.add.rectangle(750, 610, 18, 20, 0xffffff, 0);
    this.physics.add.existing(this.playerBody);
    const bodyPhysics = this.playerBody.body as Phaser.Physics.Arcade.Body;
    bodyPhysics.setCollideWorldBounds(true);
    bodyPhysics.setSize(18, 20);
  }

  private createCharactersAndInteractions() {
    // Seigneur devant la grande salle
    this.makeNpc(750, 310, 0xd6c29b, 'SEIGNEUR');
    this.interactables.push({
      x: 750, y: 310, radius: 72, label: 'Parler au seigneur',
      action: () => this.talkToLord()
    });
    // Garde près de la porte
    this.makeNpc(640, 600, 0x8b9aa5, 'GARDE');
    this.interactables.push({
      x: 640, y: 600, radius: 58, label: 'Parler au garde',
      action: () => this.dialogue.show('Garde', 'Le capitaine Kanann ! Le seigneur vous attend dans la grande salle.')
    });
    // Écuries
    this.interactables.push({
      x: 750, y: 850, radius: 85, label: 'Examiner les écuries',
      action: () => this.dialogue.show('Écuries', 'Les chevaux sont nerveux. Une rumeur de mauvais présage circule parmi les palefreniers.')
    });
  }

  private makeNpc(x: number, y: number, tunic: number, label: string) {
    const c = this.add.container(x, y, [
      this.add.ellipse(0, 14, 22, 9, 0x172017, 0.4),
      this.add.rectangle(0, 0, 18, 22, tunic).setStrokeStyle(2, 0x30343a),
      this.add.circle(0, -15, 8, 0xc99b72).setStrokeStyle(2, 0x533c30),
      this.add.rectangle(0, -21, 15, 5, 0x4b3528)
    ]).setDepth(45);
    this.add.text(x, y + 26, label, { fontFamily: 'monospace', fontSize: '9px', color: '#fff1c9',
      stroke: '#1c211d', strokeThickness: 3 }).setOrigin(0.5).setDepth(46);
    return c;
  }

  private createHud() {
    this.status = this.add.text(14, 12, 'KANANN  ♥ 100%', {
      fontFamily: 'monospace', fontSize: '12px', color: '#f4e7c7',
      backgroundColor: '#172019cc', padding: { x: 9, y: 7 }
    }).setScrollFactor(0).setDepth(200);
    this.prompt = this.add.text(0, 0, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#fff2c9',
      backgroundColor: '#172019dd', padding: { x: 8, y: 6 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);
    this.layoutHud();
    this.add.text(14, 44, 'ZQSD / FLÈCHES : BOUGER     E : INTERAGIR', {
      fontFamily: 'monospace', fontSize: '9px', color: '#e8e0c8',
      backgroundColor: '#172019aa', padding: { x: 7, y: 5 }
    }).setScrollFactor(0).setDepth(200);
    this.createTouchControls();
  }

  private layoutHud() {
    if (this.prompt) this.prompt.setPosition(this.scale.width / 2, this.scale.height - 42);
  }

  private createTouchControls() {
    const makeButton = (x: number, y: number, text: string, callback: (down: boolean) => void) => {
      const b = this.add.circle(x, y, 25, 0x18251d, 0.65).setStrokeStyle(2, 0xe1d1a8).setScrollFactor(0).setDepth(250);
      this.add.text(x, y, text, { fontFamily: 'monospace', fontSize: '15px', color: '#fff4d6' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(251);
      b.setInteractive();
      b.on('pointerdown', () => callback(true));
      b.on('pointerup', () => callback(false));
      b.on('pointerout', () => callback(false));
      return b;
    };
    const w = this.scale.width, h = this.scale.height;
    const baseX = Math.max(62, w * 0.12), baseY = h - 78;
    makeButton(baseX, baseY - 34, '↑', d => { this.touchVector.y = d ? -1 : 0; });
    makeButton(baseX, baseY + 34, '↓', d => { this.touchVector.y = d ? 1 : 0; });
    makeButton(baseX - 34, baseY, '←', d => { this.touchVector.x = d ? -1 : 0; });
    makeButton(baseX + 34, baseY, '→', d => { this.touchVector.x = d ? 1 : 0; });
    makeButton(w - 65, h - 78, 'E', d => { if (d) this.tryInteract(); });
  }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('Z,Q,S,D,E,W,A') as Record<string, Phaser.Input.Keyboard.Key>;
  }

  private showIntro() {
    this.time.delayedCall(250, () => this.dialogue.show(
      'Narrateur',
      'Au cœur du royaume, le château connaît une journée paisible. Kanann, capitaine de la garde, profite d’un instant de répit dans la cour.',
      () => this.dialogue.show('Kanann', 'Une journée calme… Voilà qui devient rare pour un vieux soldat.')
    ));
  }

  private talkToLord() {
    if (!this.missionStarted) {
      this.dialogue.show('Seigneur', 'Kanann ! Un village au sud vient d’être ravagé. Des survivants parlent d’un immense dragon rouge. Rassemble ton équipement et pars découvrir ce qui s’est passé.', () => {
        this.missionStarted = true;
        this.status.setText('MISSION : REJOINDRE LE VILLAGE AU SUD');
        this.dialogue.show('Kanann', 'Un dragon… J’espérais ne plus jamais entendre ce nom. Je pars immédiatement.');
      });
    } else {
      this.dialogue.show('Seigneur', 'Ne perds pas de temps, Kanann. Le village a besoin de secours.');
    }
  }

  private tryInteract() {
    if (this.dialogue.isOpen) return;
    const px = this.player.x, py = this.player.y;
    const nearest = this.interactables
      .map(i => ({ ...i, d: Phaser.Math.Distance.Between(px, py, i.x, i.y) }))
      .filter(i => i.d <= i.radius)
      .sort((a, b) => a.d - b.d)[0];
    nearest?.action();
  }

  update() {
    if (!this.player || this.dialogue?.isOpen) {
      this.playerBody.body && (this.playerBody.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      return;
    }
    const left = this.cursors.left.isDown || this.keys.Q.isDown || this.keys.A.isDown || this.touchVector.x < 0;
    const right = this.cursors.right.isDown || this.keys.D.isDown || this.touchVector.x > 0;
    const up = this.cursors.up.isDown || this.keys.Z.isDown || this.keys.W.isDown || this.touchVector.y < 0;
    const down = this.cursors.down.isDown || this.keys.S.isDown || this.touchVector.y > 0;
    const vx = (right ? 1 : 0) - (left ? 1 : 0);
    const vy = (down ? 1 : 0) - (up ? 1 : 0);
    const body = this.playerBody.body as Phaser.Physics.Arcade.Body;
    const vec = new Phaser.Math.Vector2(vx, vy).normalize().scale(150);
    body.setVelocity(vec.x, vec.y);
    this.player.setPosition(this.playerBody.x, this.playerBody.y);
    const near = this.interactables.some(i => Phaser.Math.Distance.Between(this.player.x, this.player.y, i.x, i.y) <= i.radius);
    this.prompt.setText(near ? 'E  •  INTERAGIR' : '');
    this.prompt.setVisible(near);
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.tryInteract();
  }
}
