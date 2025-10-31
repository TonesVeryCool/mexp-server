export const serverConfig = {
    'scheme': 'http',
    'ip': 'localhost',
    'port': 8337,
    'redirectUrl': '', // if this is set to anything, /anymozu5/me/main/host responds with this instead of the automatic one
    'data': 'mexp',
    'extraLogging': true, // at the cost of inaccuracy, have more logs
    'allowPlugins': false,
    'allowTerminalCommands': true,

}

export const gameConfig = {
    'version': 37,
    'allowed': true,
    'accountCreation': true,
    'authorizerHash': 'the hash128 of authorizer.txt here',
    'validateTokens': true,
    'validateMaps': true,
    'allTokens': [
        'cave', 'ballpit', 'station', 'station_disco', 'employee',
        'vip', 'theater', 'museum', 'museumexit', 'underground_part1',
        'underground_part2', 'corporation', 'basement'
    ],
    'ballpitAltChance': 2 // percentage
}

export const speakConfig = {
    'speakEnabled': true,
    'ingameError': 'speak is disabled.',
    'webhookError': 'deny',
}

// if using a reverse proxy that has https, this is useless
// only use this if you **want** it to only be accessible with https
export const httpsConfig = {
    'fullchain': '', // path to fullchain.pem
    'privkey': '', // path to privkey.pem
}

export const webhookConfig = {
    'url': '', // leave empty to not use webhooks
    'name': 'MineXplorer',
}

export const ghostMixing: Array<Array<string>> = [
    ["map_welcome", "map_house", "map_welcome_beach"],
    ["map_cave", "map_cave_pond"],
    ["map_ballpit", "map_ballpit_cave"],
    
]

export const tokenMapping: Record<string, string> = {
    'cave': 'map_welcome',
    'ballpit': 'map_void',
    'station': 'map_ballpit',
    'station_disco': 'map_ballpit',
    'employee': 'map_maze',
    'vip': 'map_maze',
    'basement': 'map_maze',
    'theater': 'map_vip',
    'museum': 'map_theater',
    'museumexit': 'map_museum_part3',
    'underground_part1': 'map_museum_part4',
    'underground_part2': 'map_parkour',
    'corporation': 'map_ballpit_alt'
};

export const mapTokens: Record<string, string> = {
    'map_welcome': '',
    'map_welcome_beach': '',
    'map_house': '',
    'map_house_jukeroom': '',
    'map_hell': '',
    'map_void': '',
    'map_void_white': '',
    'map_parkour': '',
    'map_herobrine': '',
    'map_maze': '',
    'map_cave_pond': '',
    
    'map_ballpit': 'ballpit',
    'map_ballpit_cave': 'cave',
    'map_ballpit_alt': '',
    'map_cave': 'cave',
    'map_vip': 'vip',

    'map_corporation_part1': 'corporation',
    'map_corporation_part2': 'corporation',
    'map_corporation_part3': 'corporation',
    'map_corporation_part4': 'corporation',
    'map_corporation_part5': 'corporation',
    'map_corporation_part6': 'corporation',
    'map_corporation_part7': 'corporation',
    'map_corporation_part8': 'corporation',
    'map_corporation_part9': 'corporation',
    'map_corporation_part10': 'corporation',
    'map_corporation_part11': 'corporation',
    'map_corporation_part12': 'corporation',
    'map_corporation_part13': 'corporation',
    'map_corporation_part14': 'corporation',
    'map_corporation_part15': 'corporation',
    'map_corporation_part16': 'corporation',
    'map_corporation_part17': 'corporation',
    'map_corporation_part18': 'corporation',
    'map_corporation_part19': 'basement',
    'map_corporation_part20': 'basement',

    'map_underground_part1': 'underground_part1',
    'map_underground_part2': 'underground_part2',

    'map_theater': 'theater',
    'map_theater_employee': 'employee',

    'map_station_disco': 'station',
    'map_station_break': 'station',
    'map_station_check': 'station',
    'map_station_four': 'station',
    'map_station_gallery': 'station',
    'map_station_hallway': 'station',
    'map_station_low': 'station',
    'map_station_prison': 'station',
    'map_station_levers': 'employee',
    'map_station_storage': 'employee',

    'map_museum_part0': 'youdontknowhowtoopendoors',
    'map_museum_part1': 'museum',
    'map_museum_part2': 'museum',
    'map_museum_part3': 'museum',
    'map_museum_part4': 'museum',
    'map_museum_part5': 'museum',
    'map_museum_part6': 'museum',
    'map_museum_part7': 'museum',
};