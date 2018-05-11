module.exports = (function () {

    function isGroup(contact) {
        return contact['MemberCount'] > 0;
    }

    function findContactByNickName(contacts, nickname) {
        for (let usrname in contacts) {
            let contact = contacts[usrname];
            if (contact['NickName'] === nickname) {
                return contact;
            }
        }
        return null;
    }

    function findContactByRemarkName(contacts, remarkname) {
        for (let usrname in contacts) {
            let contact = contacts[usrname];
            if (contact['RemarkName'] === remarkname) {
                return contact;
            }
        }
        return null;
    }


    return {
        findContactByNickName: findContactByNickName,
        findContactByRemarkName: findContactByRemarkName
    };

})();
