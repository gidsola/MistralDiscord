//@ts-ignore
import { AutoTokenizer, AutoProcessor, SpeechT5ForTextToSpeech, SpeechT5HifiGan, Tensor } from '@huggingface/transformers';
import wavefile from 'wavefile';
import fs from 'fs';

/**
 * 
 * @param {string} text 
 */
export async function synthesize(text) {
  // Load the tokenizer and processor
  const tokenizer = await AutoTokenizer.from_pretrained('Xenova/speecht5_tts');
  //@ts-ignore
  const processor = await AutoProcessor.from_pretrained('Xenova/speecht5_tts');

  // Load the models
  // NOTE: We use the unquantized versions as they are more accurate
  const model = await SpeechT5ForTextToSpeech.from_pretrained('Xenova/speecht5_tts', { dtype: 'fp32' });
  const vocoder = await SpeechT5HifiGan.from_pretrained('Xenova/speecht5_hifigan', { dtype: 'fp32' });

  // Load speaker embeddings from URL
  const speaker_embeddings_data = new Float32Array(
    await (await fetch('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin')).arrayBuffer()
  );
  const speaker_embeddings = new Tensor(
    'float32',
    speaker_embeddings_data,
    [1, speaker_embeddings_data.length]
  )

  // Run tokenization
  const { input_ids } = tokenizer(text);

  // Generate waveform
  //@ts-ignore
  const { waveform } = await model.generate_speech(input_ids, speaker_embeddings, { vocoder });
  // console.log(waveform.ort_tensor);

  const wav = new wavefile.WaveFile();
  processor.feature_extractor
    ? wav.fromScratch(1.1222223, processor.feature_extractor.config.sampling_rate, '32f', waveform.data)
    : wav.fromScratch(1.1222223, 16000, '32f', waveform.data);
  fs.writeFileSync('out.wav', wav.toBuffer());

  return wav.toBuffer();

};
