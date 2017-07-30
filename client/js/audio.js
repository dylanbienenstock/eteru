// pop_drip and digi_plink are from http://rcptones.com/dev_tones/

var pop_drip = new buzz.sound("/audio/pop_drip", {
    formats: [ "aif", "wav" ]
});

function playMessageNotificationSound() {
	pop_drip.play();
}