// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var questions = require('./data')
cc.Class({
    extends: cc.Component,
    properties: {
        bubbleNum: 4, //候选单词数量
        bubblePrefab: {
            default: null,
            type: cc.Prefab
        },
        gameOverPrefab: {
            default: null,
            type: cc.Prefab
        },
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        word_img: {
            default: null,
            type: cc.Sprite
        }
    },
    start() {

    },
    spawnBubble() {
        this.bubbles = new Array()
        for (let i = 0; i < this.bubbleNum; i++) {
            let bubble = cc.instantiate(this.bubblePrefab)
            bubble.setPosition(250 * i - 400, -200) //TODO:需要根据坐标系和屏幕宽度计算
            let bubbleComp = bubble.getComponent('Bubble')
            bubbleComp.word = this.currentQuestion.options[i]
            this.bubbles[i] = bubbleComp
            this.node.addChild(bubble)
        }
    },
    spawnWordImg() {
        let self = this;
        cc.loader.loadRes(this.currentQuestion.img, cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            self.word_img.spriteFrame = spriteFrame;
        });
    },
    gainScore(bubble) {
        let tagetWord = bubble.word
        if (tagetWord === this.currentQuestion.answer) {
            this.score += 1;
            // 更新 scoreDisplay Label 的文字
            this.scoreDisplay.string = '分数: ' + this.score;
            // 播放得分音效
            bubble.playScoreAudio()
            this.reProduceBubble()
            // bubble.removeFromeParent()
        } else {
            bubble.playProduceSound()
            this.gameOver()
        }
    },
    reProduceBubble() {
        this.bubbles.forEach(bubble => {
            bubble.node.destroy();
        });
        if (this.resourceIndex === questions.length - 1) {
            this.resourceIndex = 0
        } else {
            this.resourceIndex += 1
        }
        this.currentQuestion = questions[this.resourceIndex]
        this.spawnWordImg()
        this.spawnBubble()
    },
    gameOver() {
        this.bubbles.forEach(bubble => {
            bubble.stopAction()
        })
        this.gameOverPanel = cc.instantiate(this.gameOverPrefab)
        this.gameOverPanel.getComponent('GameOver').scoreDisplay.string = '总分数: ' + this.score;
        this.node.addChild(this.gameOverPanel)
    },
    onLoad() {
        this.resourceIndex = 0
        this.currentQuestion = questions[this.resourceIndex]
        this.score = 0;
        // 初始化计时器
        this.spawnWordImg()
        this.spawnBubble()
        this.node.on('bubbleClick', event => {
            let bubble = event.target.getComponent('Bubble')
            this.gainScore(bubble)
        })
        this.node.on('restartGame', event => {
            this.gameOverPanel.destroy()
            this.restartGame()
        })
    },
    restartGame() {
        this.score = 0
        this.scoreDisplay.string = '分数: ' + this.score;
        this.reProduceBubble()
    }

    // update (dt) {},
});