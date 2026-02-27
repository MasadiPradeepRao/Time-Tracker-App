import { Jimp } from "jimp";

async function main() {
    try {
        const img192 = new Jimp({ width: 192, height: 192, color: 0x000000ff });
        await img192.write("public/icon-192.png");
        const img512 = new Jimp({ width: 512, height: 512, color: 0x000000ff });
        await img512.write("public/icon-512.png");
        console.log("Images created");
    } catch (e) {
        console.error("Error with new Jimp() config, trying fallback", e.message);
        try {
            // jimp v0.x fallback
            const j = (await import("jimp")).default;
            new j(192, 192, 0x000000ff, (err, image) => {
                image.write("public/icon-192.png");
            });
            new j(512, 512, 0x000000ff, (err, image) => {
                image.write("public/icon-512.png");
            });
        } catch (e2) {
            console.error("Fallback failed", e2.message);
        }
    }
}
main();
