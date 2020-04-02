import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";
import { Message } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import got from "got";
import AWS from "aws-sdk";
import path from "path";

export default class Focus extends Command {
    constructor() {
        super(
            "focus",
            "Makes an image very cool.",
            undefined,
            ["SEND_MESSAGES", "ATTACH_FILES"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        const lang = await this.getLanguage(msg);
        return new Promise(async resolve => {
            let messages = await msg.channel.messages.fetch({ limit: 5 });
    
            let img = messages.find(message => message.author.id == msg.author.id && message.attachments.size > 0);
    
            if (!img) {
                return resolve(await this.fail(msg, lang.face_fail_noimg));
            }
    
            let attachment = img.attachments.first();
    
            msg.channel.startTyping();
    
            let resp = await got(attachment.url, { encoding: null });
    
            const credentials = new AWS.SharedIniFileCredentials();
            AWS.config.credentials = credentials;
            AWS.config.update({ region: "us-east-1" });
    
            const rekognition = new AWS.Rekognition();
    
            rekognition.detectFaces({
                Image: {
                    Bytes: resp.body
                }
            }, async (err, data) => {
                if (err) {
                    console.log(err);
                    return resolve(await this.fail(msg, lang.face_error));
                }

                if (!data.FaceDetails) {
                    return resolve(await this.fail(msg, lang.face_error));
                }
    
                let canvas = createCanvas(attachment.width, attachment.height);
                let ctx = canvas.getContext("2d");
    
                let image = await loadImage(resp.body);
                let flare = await loadImage(path.resolve(__dirname, "../../../assets/red-flare.png"));
    
                ctx.drawImage(image, 0, 0);
    
                let pairsFound = 0;
    
                data.FaceDetails.forEach(face => {
                    if (!face.Landmarks || !face.BoundingBox) return;
    
                    let leftEye = face.Landmarks.find(landmark => landmark.Type == "eyeLeft");
                    let rightEye = face.Landmarks.find(landmark => landmark.Type == "eyeRight");
    
                    if (!leftEye || !rightEye || !leftEye.X || !leftEye.Y || !rightEye.X || !rightEye.Y) return;
    
                    pairsFound++;
    
                    let lx = attachment.width * leftEye.X;
                    let ly = attachment.height * leftEye.Y;
                    let rx = attachment.width * rightEye.X;
                    let ry = attachment.height * rightEye.Y;
    
                    ctx.drawImage(flare, lx - 600 * (attachment.width / 1200), ly - 337 * (attachment.width * (674 / 1200) / 674), attachment.width, attachment.width * (674 / 1200));
                    ctx.drawImage(flare, rx - 600 * (attachment.width / 1200), ry - 337 * (attachment.width * (674 / 1200) / 674), attachment.width, attachment.width * (674 / 1200));
                });
    
                if (!pairsFound) {
                    return resolve(await this.fail(msg, lang.face_fail_novalidface));
                }
    
                await msg.channel.send({
                    files: [canvas.toBuffer()]
                });
    
                resolve(true);
            });
        });
    }
}