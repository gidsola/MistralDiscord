import * as tf from '@tensorflow/tfjs-node';

// Define the model
async function createModel() {
  const model = tf.sequential();

  // Add layers to the model
  model.add(tf.layers.dense({ units: 10, inputShape: [13], activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

  // Compile the model
  model.compile({
    optimizer: 'adam',
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });

  return model;
}

// Train the model
async function trainModel(model, data, labels) {
  const xs = tf.tensor2d(data);
  const ys = tf.tensor2d(labels);

  await model.fit(xs, ys, {
    epochs: 10,
    batchSize: 32,
    validationSplit: 0.2
  });
}

// Predict using the model
async function predict(model, inputData) {
  const inputTensor = tf.tensor2d([inputData]);
  const prediction = model.predict(inputTensor);
  const predictionData = await prediction.data();
  return predictionData;
}

// Example usage
(async () => {
  const model = await createModel();

  // Dummy data for training
  const data = Array.from({ length: 100 }, () => Array.from("holy mackeral", () => Math.random()));
  const labels = Array.from({ length: 100 }, () => [Math.random() > 0.5 ? 1 : 0]);

  await trainModel(model, data, labels);

  // Dummy input for prediction
  const inputData = Array.from("holy mackeral", () => Math.random());
  const prediction = await predict(model, inputData);

  console.log('Prediction:', prediction);
})();