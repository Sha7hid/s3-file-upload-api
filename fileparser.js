const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3");
const Transform = require("stream").Transform;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const parsefile = async (req) => {
  return new Promise((resolve, reject) => {
    upload.single("file")(req, null, async (err) => {
      if (err) {
        reject(err);
        return;
      }

      const file = req.file;
      if (!file) {
        reject("No file provided");
        return;
      }

      try {
        // upload to S3
        const uploadResponse = await new Upload({
          client: new S3Client({
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
            region,
          }),
          params: {
            ACL: "public-read",
            Bucket,
            Key: `${Date.now().toString()}-${file.originalname}`,
            Body: file.buffer,
          },
          tags: [], // optional tags
          queueSize: 4, // optional concurrency configuration
          partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
          leavePartsOnError: false, // optional manually handle dropped parts
        })
          .done();

        resolve(uploadResponse);
      } catch (error) {
        reject(error);
      }
    });
  });
};

module.exports = parsefile;