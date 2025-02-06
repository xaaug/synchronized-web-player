export default async function getYoutubeData() {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=Wbfj2ImZ4VU&key=AIzaSyAaRuCq0XM-ywbjuLnvou_rQxOp6MNT0dc`)

    const data = await res.json()

    console.log(data)
}

getYoutubeData()