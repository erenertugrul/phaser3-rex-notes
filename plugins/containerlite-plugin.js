import Factory from './gameobjects/containerlite/Factory.js';
import Creator from './gameobjects/containerlite/Creator.js';
import ContainerLite from './gameobjects/containerlite/ContainerLite.js';
import SetValue from './utils/object/SetValue.js';

class ContainerLitePlugin extends Phaser.Plugins.BasePlugin {

    constructor(pluginManager) {
        super(pluginManager);

        //  Register our new Game Object type
        pluginManager.registerGameObject('rexContainerLite', Factory, Creator);
    }

    start() {
        var eventEmitter = this.game.events;
        eventEmitter.once('destroy', this.destroy, this);
    }
}

SetValue(window, 'RexPlugins.GameObjects.ContainerLite', ContainerLite);

export default ContainerLitePlugin;