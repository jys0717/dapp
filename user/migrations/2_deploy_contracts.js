const Music = artifacts.require("music");

module.exports = function(deployer) {
    deployer.deploy(Music);
};