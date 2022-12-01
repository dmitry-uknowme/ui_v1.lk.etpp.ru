const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () =>
      //@ts-expect-error
      resolve(reader.result.replace(/^data:.+;base64,/, ""));
    reader.onerror = (error) => reject(error);
  });

export default toBase64;
