const User = require("../models/user");
const express = require("express");
const { findById } = require("../models/user");
const router = new express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const sharp = require("sharp");

const { sendWelcomeEmail, cancellationEmail } = require("../emails/account");
//Crerating a new user
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(500).send(e);
  }
});
//Reading user profile
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});
//Login user
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    //*Here we are not using User but the user instance
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
//Logout user
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});
//Logout from allUserTokens
router.post("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
//Updating an user
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "age", "email", "password"];
  const isAllowed = updates.every((update) => allowedUpdates.includes(update));
  if (!isAllowed) {
    return res.status(404).send({ error: "Invalid user update" });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});
//Delete an user
router.delete("/users/me", auth, async (req, res) => {
  try {
    //mongoose method for removing
    await req.user.remove();
    cancellationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Uploading the user avatar
const upload = multer({
  //dest:"avatar"
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload a correct photo format"));
    }
    //Telling callback that there is no problem with the req hence undefined and the file s of requsted format
    cb(undefined, true);
  },
});
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    //Here we removed the dest folder.
    //To access the user prf image data we use req.file.buffer
    //Converting everyimage to png and resizing them
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
//Deleting the avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});
//Get avatar
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user.avatar || !user) {
      throw new Error();
    }
    //Tell the requester the type of the image
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});
module.exports = router;

//Updating an user
// router.patch("/users/:id", async (req, res) => {
//   const updates = Object.keys(req.body);
//   const allowedUpdates = ["name", "age", "email", "password"];
//   const isAllowed = updates.every((update) => allowedUpdates.includes(update));
//   if (!isAllowed) {
//     return res.status(404).send({ error: "Invalid user update" });
//   }
//   try {
//     //find by id and update bypasses midddleware
//     const updateUser = await User.findById(req.params.id);
//     //Iterating through updates
//     updates.forEach((update) => (updateUser[update] = req.body[update]));
//     //saving the update
//     await updateUser.save();

//     if (!updateUser) {
//       return res.send(404).send();
//     }
//     res.send(updateUser);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

//Reading a user
// router.get("/users/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.send(user);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

//deleting a user

// const deleteUser = await User.findByIdAndDelete(req.user._id);
// if (!deleteUser) {
//   return res.status(404).send();
// }
