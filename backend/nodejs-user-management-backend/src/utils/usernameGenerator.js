function generateUsername(fullName) {
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0].toLowerCase();
    const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generates a random number between 1000 and 9999
    return `${firstName}${randomNumbers}`;
}

module.exports = generateUsername;