module.exports = {
    data: {
        name: "ping",
        description: "Reply with pong!",
    },
    async execute(msg) {
        msg.reply("Pong!");
    },
};
