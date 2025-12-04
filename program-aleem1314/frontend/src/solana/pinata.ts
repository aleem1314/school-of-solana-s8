export async function uploadToPinata(file: File): Promise<string> {
    const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
    if (!PINATA_JWT) throw new Error("Pinata JWT missing in .env");

    const formData = new FormData();
    formData.append("file", file, file.name);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error("Pinata upload failed: " + t);
    }

    const data = await res.json();
    const cid = data.IpfsHash;

    return cid;
}
