import { Command } from "../../../lib/exec/Command";
import { Client } from "../../../lib/types/Client";;
import { Message } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import got from "got";
import AWS from "aws-sdk";
import path from "path";

export default class Gibus extends Command {
    constructor() {
        super(
            "gibus",
            "Gives an image a ghostly gibus. Must be used right after posting an image.",
            undefined,
            ["SEND_MESSAGES", "ATTACH_FILES"]
        );
    }

    async run(client: Client, msg: Message): Promise<boolean> {
        return new Promise(async resolve => {
            let messages = await msg.channel.fetchMessages({ limit: 5 });
    
            let img = messages.find(message => message.author.id == msg.author.id && message.attachments.size > 0);
    
            if (!img) {
                return resolve(await this.fail(msg, "No image found."));
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
                    return resolve(await this.fail(msg, "An error occured while trying to detect faces."));
                }

                if (!data.FaceDetails) {
                    return resolve(await this.fail(msg, "An error occured while trying to detect faces."));
                }
    
                let canvas = createCanvas(attachment.width, attachment.height);
                let ctx = canvas.getContext("2d");
    
                let image = await loadImage(resp.body);
                let hat = await loadImage(path.resolve(__dirname, "../../../assets/gibus.png"));
    
                ctx.drawImage(image, 0, 0);
    
                let headsFound = 0;
    
                data.FaceDetails.forEach(face => {
                    if (!face.BoundingBox) return;
                    if (!face.BoundingBox.Width || !face.BoundingBox.Height || !face.BoundingBox.Left || !face.BoundingBox.Top) return;
    
                    headsFound++;
    
                    let width = attachment.width * face.BoundingBox.Width;
                    let height = attachment.height * face.BoundingBox.Height;
                    let left = attachment.width * face.BoundingBox.Left;
                    let top = attachment.height * face.BoundingBox.Top;
    
                    ctx.drawImage(hat, left - width * 1.5 * (269 / 272) / 4, top - height + (width * 1.5 * (269 / 272) / 4), width * 1.5, width * 1.5 * (269 / 272));
                });

                if (!headsFound) {
                    return resolve(await this.fail(msg, "No valid face found."));
                }

                await msg.channel.send({
                    files: [canvas.toBuffer()]
                });

                resolve(true);
            });
        });
    }
}