var fire = "fire"
var lighting = "lightning"
var water = "water"
var earth = "earth"
var power = "PWR";
var enemies = document.getElementsByClassName("encounter-container");
var enemiesArray = [];
var changeColor = document.getElementById("changeColor");
var weaponDiv = document.getElementsByClassName("weapon-icon-wrapper").item(0);
var logginEnabled = false;

(function calculateWinRate() {


    for (let i = 0; i < enemies.length; i++) {
        let elementDiv = enemies.item(i).getElementsByClassName("encounter-element").item(0)
        let power = enemies.item(i).getElementsByClassName("encounter-power").item(0).textContent.replace(/\D/g, '');
        let element = parseElement(elementDiv.firstElementChild.className)
        enemiesArray.push(
            {
                "element": element,
                "power": power
            }
        )
    }

    finalResult = fight(getCharacterStats(), enemiesArray, getWeaponElement(weaponDiv), getWeaponStats(weaponDiv))
    chrome.runtime.sendMessage({fightResult: finalResult})
    return finalResult

})();

function log(message){
    if (logginEnabled == true){
        console.log(message)
    }
}
function getBonusPower() {
    let allLB = document.getElementsByClassName("bonus-power").item(0).children
    let bonus = 0
    for (let i = 0; i < allLB.length; i++) {
        let currentLB = allLB[i].textContent
        let amount = currentLB.split(" ")[0]
        let lbType = currentLB.split(" ")[1]
        if (lbType == "LB") {
            bonus += amount * 15
        }
        if (lbType == "4B") {
            bonus += amount * 30
        }
        if (lbType == "5B") {
            bonus += amount * 60
        }
    }
    return bonus
}


function getCharacterStats() {
    let characterPower = document.getElementsByClassName("subtext subtext-stats").item(0).children.item(3).textContent.replace(/\D/g, '')
    characterPower = parseInt(characterPower)
    let characterElement = document.getElementsByClassName("name bold character-name").item(0).children.item(0).className.split(" ")[0];
    characterElement = parseElement(characterElement)
    log("power " + characterPower)
    log("element " + characterElement)
    return {
        "power": characterPower,
        "element": characterElement
    }
}

function getWeaponStats(weaponDiv) {
    let weaponStatsDiv = weaponDiv.getElementsByClassName("stats").item(0).children;
    let weaponStats = []
    let weaponElementsStats = []
    for (let i = 0; i < weaponStatsDiv.length; i++) {
        let statText = weaponStatsDiv[i].lastElementChild.textContent
        statText = statText.split(" ")
        let element = parseWeaponElement(statText[0].trim()).trim();
        let amount = parseInt(statText[1].replace(/\D/g, ''));
        log("element" + element)
        log("amount" + amount)
        let stat = {
            element: element,
            amount: amount
        }
        log(stat)
        weaponElementsStats.push(stat)
    }
    weaponStats = {
        bonusPower: getBonusPower(),
        elementsStats: weaponElementsStats
    }

    log(weaponStats)
    return weaponStats
}

function getWeaponElement(weaponDiv) {
    let weaponElement = weaponDiv.getElementsByClassName("trait").item(0).firstElementChild.className
    weaponElement = parseElement(weaponElement)
    log("weapon " + weaponElement)
    return weaponElement
}

function getRandom() {
    let min = -10
    let max = 10
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

function parseWeaponElement(unparsedElement) {
    if (unparsedElement == "INT") {
        return water
    } else if (unparsedElement == "CHA") {
        return lighting
    } else if (unparsedElement == "STR") {
        return fire
    } else if (unparsedElement == "DEX") {
        return earth
    } else if (unparsedElement == "PWR") {
        return power
    }
}

function parseElement(unparsedElement) {
    if (unparsedElement == "water-icon") {
        return water
    } else if (unparsedElement == "lightning-icon") {
        return lighting
    } else if (unparsedElement == "fire-icon") {
        return fire
    } else if (unparsedElement == "earth-icon") {
        return earth
    }
}

function playerEnemyElementsTrait(charElement, enemyElement) {
    let bonus = 0
    if (charElement == fire) {
        if (enemyElement == earth) {
            bonus += 0.075
        } else if (enemyElement == water) {
            bonus -= 0.075
        }
    } else if (charElement == earth) {
        if (enemyElement == lighting) {
            bonus += 0.075
        } else if (enemyElement == fire) {
            bonus -= 0.075
        }
    } else if (charElement == lighting) {
        if (enemyElement == water) {
            bonus += 0.075
        } else if (enemyElement == earth) {
            bonus -= 0.075
        }
    } else if (charElement == water) {
        if (enemyElement == fire) {
            bonus += 0.075
        } else if (enemyElement == lighting) {
            bonus -= 0.075
        }
    }
    return bonus;
}

function calculateAttributeTotal(weaponAttributes) {
    let attributeTotal = 0
    let elementsStats = weaponAttributes.elementsStats;
    for (let i = 0; i < elementsStats.length; i++) {
        attributeTotal += elementsStats[i].amount
    }
    return attributeTotal;
}

function calculateEvaluatedAttributeTotal(weaponAttributes, charElement) {
    let evaluatedAttributeTotal = 0
    let weaponAttributesStats = weaponAttributes.elementsStats
    for (let i = 0; i < weaponAttributesStats.length; i++) {
        let evaluatedAttributePower = 0
        let attributeElement = weaponAttributesStats[i].element
        let attributeValue = weaponAttributesStats[i].amount
        if (attributeElement != charElement) {
            evaluatedAttributePower = (attributeValue * 0.0025)
        }
        if (attributeElement == power) {
            evaluatedAttributePower = (attributeValue * 0.002575)
        }
        if (attributeElement == charElement) {
            evaluatedAttributePower = (attributeValue * 0.002675)
        }
        evaluatedAttributeTotal += evaluatedAttributePower
    }
    return evaluatedAttributeTotal;
}

function fight(characterStats, enemies, weaponElement, weaponAttributes) {
    let charElement = characterStats.element
    let charPower = characterStats.power
    let bonusPower = weaponAttributes.bonusPower
    attributeTotal = calculateAttributeTotal(weaponAttributes);
    evaluatedAttributeTotal = calculateEvaluatedAttributeTotal(weaponAttributes, charElement);
    let unalignedPower = (((attributeTotal * 0.0025) + 1) * charPower) + bonusPower
    let alignedPower = (((evaluatedAttributeTotal + 1) * charPower) + bonusPower)

    log("    ###########################       ")
    log("char element: " + charElement)
    log("weapon element: " + weaponElement)
    log("char power: " + charPower)
    log("bonus power: " + bonusPower)
    log("aligned power: " + bonusPower)

    fightsResults = []
    for (let i = 0; i < enemies.length; i++) {
        let traitBonus = 1
        let enemyElement = enemies[i].element
        let enemyPower = parseInt(enemies[i].power)
        if (charElement == weaponElement) {
            traitBonus += 0.075
        }
        traitBonus += playerEnemyElementsTrait(charElement, enemyElement, traitBonus);


        let characterPowerWithTrait = alignedPower * traitBonus
        characterPowerWithTrait = parseInt(characterPowerWithTrait)
        const fights = 10000

        log(" ---------------------- ")
        log("enemy " + (i + 1) + ":")
        log("enemy power : " + enemyPower)
        log("enemy element: " + enemyElement)
        log("trait bonus: " + traitBonus)
        log("character power with trait: " + characterPowerWithTrait)
        log("fighting " + fights + " times")

        let characterRolled = 0
        let enemyRolled = 0
        let characterWins = 0
        for (let j = 0; j < fights; j++) {
            let finalCharacterPower = 0
            let finalEnemyPower = 0
            let characterRandom = getRandom()
            characterRandom = characterRandom != 0 ? characterRandom / 100 : characterRandom
            let enemyRandom = getRandom()
            enemyRandom = enemyRandom != 0 ? enemyRandom / 100 : enemyRandom
            finalCharacterPower = characterPowerWithTrait + (characterPowerWithTrait * characterRandom)
            finalEnemyPower = enemyPower + (enemyPower * enemyRandom)
            characterRolled += finalCharacterPower
            enemyRolled += finalEnemyPower
            if (finalCharacterPower > finalEnemyPower) {
                characterWins++
            }
        }
        winPercentage = characterWins * 100 / fights
        characterRolled = characterRolled / fights
        enemyRolled = enemyRolled / fights
        log("win-percentage " + winPercentage + "%")
        fightsResults.push({
            "characterRolled": characterRolled,
            "enemyRolled": enemyRolled,
            "winRate": winPercentage,
            "enemyNumber": i + 1,
            "enemyOriginalPower": enemyPower
        })
    }
    return fightsResults
}



