const { default: axios } = require('axios');
const fs = require('fs')

require('dotenv').config();

const apiKey = process.env.YTB_API_KEY;
const webhook = process.env.DISCORD_WEBHOOK_URL
const channelId = process.env.CHANNEL_ID
const hoje = new Date()
const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000)

const parameters = {
  part: 'snippet',
  channelId: channelId,
  order: 'date',
  maxResults: 1,
  type: "video",
  key: apiKey,
  publishedAfter: ontem.toISOString(),
  publishedBefore: hoje.toISOString()
}

const saveLastVideoId = (videoId) => {
  if (!videoId) return;

  fs.readFile('lastVideo.txt', 'utf8', (err, archData) => {
    if (err || videoId !== archData) {
      fs.writeFile('lastVideo.txt', videoId, (err) => {
        if (err) return console.log('Erro ao gravar ID do vídeo');

        console.log('ID novo gravado com sucesso:', videoId);

        //Notifica o Discord
        axios.post(webhook, {
          content: `🎬 @everyone \nNovo vídeo no canal! Assista agora: https://www.youtube.com/watch?v=${videoId}`
        }).then(() => {
          console.log('Notificação enviada ao Discord');
        }).catch((e) => {
          console.error('Erro ao enviar para Discord:', e.message);
        });
      });
    } else {
      console.log('Nenhum novo vídeo postado!');
    }
  });
};


const newVideoSearch = async () => {
  try {
    const result = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: parameters
    });

    console.log(JSON.stringify(result.data, null, 2));
    if (result.data.items[0]) {
      const data = result.data.items[0].id.videoId
      saveLastVideoId(data)
    } else {
      console.log()
    }

  } catch (error) {
    console.error('Erro ao buscar vídeo:', error.response?.data || error.message);
  }
};

newVideoSearch();

