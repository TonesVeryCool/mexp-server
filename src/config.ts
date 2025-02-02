export const config = {
    'scheme': 'http',
    'ip': 'localhost',
    'port': 19968,
    'data': 'mexp',
    'version': 36,
    'allowed': true,
    'accountCreation': true,
    'authorizerText': '',
    'validateTokens': true,
    'validateMaps': true,
    'allTokens': [
        'cave', 'ballpit', 'station', 'station_disco', 'employee',
        'vip', 'theater', 'museum', 'museumexit', 'underground_part1',
        'underground_part2', 'corporation'
    ],
}

export const webhookConfig = {
    'url': '', // leave empty to not use webhooks
    'name': 'MineXplorer',
}

export const tokenMapping: Record<string, string> = {
    'cave': 'map_welcome',
    'ballpit': 'map_void',
    'station': 'map_ballpit',
    'station_disco': 'map_ballpit',
    'employee': 'map_maze',
    'vip': 'map_maze',
    'theater': 'map_vip',
    'museum': 'map_theater',
    'museumexit': 'map_museum_part3',
    'underground_part1': 'map_museum_part4',
    'underground_part2': 'map_ballpit_alt',
    'corporation': 'map_test5' // just a guess
};

export const mapTokens: Record<string, string> = {
    'map_welcome': '',
    'map_welcome_beach': '',
    'map_house': '',
    'map_hell': '',
    'map_void': '',
    'map_parkour': '',
    'map_herobrine': '',
    'map_maze': '',
    'map_cave_pond': '',
    
    'map_ballpit': 'ballpit',
    'map_ballpit_cave': 'cave',
    'map_cave': 'cave',
    'map_vip': 'vip',

    'map_corporation': 'corporation',

    'map_underground_part1': 'underground_part1',
    'map_underground_part2': 'underground_part2',

    'map_theater': 'theater',
    'map_theater_employee': 'employee',

    'map_station_disco': 'station_disco',
    'map_station_break': 'station_disco',

    'map_museum_part0': 'youdontknowhowtoopendoors',
    'map_museum_part1': 'museum',
    'map_museum_part2': 'museum',
    'map_museum_part3': 'museum',
    'map_museum_part4': 'museum',
    'map_museum_part5': 'museum',
    'map_museum_part6': 'museum',
    'map_museum_part7': 'museum',
};