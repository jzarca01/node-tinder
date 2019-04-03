const Tinder = require('../');
const tinder = new Tinder({
  phoneNumber: '+33601020304'
});

const prompt = require('prompt-async');

async function init() {
  try {
    await tinder.requestAuth();
    prompt.start();
    const { verifyCode } = await prompt.get(['verifyCode']);
    await tinder.validateAuth(verifyCode);
    await tinder.setRefreshToken(
      'eyJEFDYSYKYHKSFH.dsfdfdsfds.dsl63V0K_vXyiQgI4z0DDb-I3959FHDJSHJSH'
    );
    await tinder.login();

    const profile = await tinder.getUpdates();
    const matches = profile.matches.map(match => ({
      profileId: match.person._id,
      name: match.person.name,
      photo: match.person.photos[0].url,
      messages: match.messages
    }));
    await Promise.all(
      matches.map(
        async match => await tinder.sendMessage(match.profileId, 'Hey guuuuurl')
      )
    );

    await tinder.likeEmAll();
  } catch (err) {
    console.log(err);
  }
}

init();
