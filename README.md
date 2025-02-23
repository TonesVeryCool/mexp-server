# mexp-server
MineXplorer server recreation written with Deno

# How to use
- Testing: `deno task dev`
- Prod: `deno task run`

# TODO
- [x] speak toggle option in config
- [x] shared ghosts between maps
- [x] 5 character users only (block users with the first 5 characters being the same but the rest being different)
- [ ] special bans (force hell/force void) (was this ever used outside of `tutwh` anyway?)
- [ ] game downloads (`/version/mexp`)
- [x] test versions below v35

# Inaccuracies
- Speak has some inaccuracies with word mixing
- Profile last online dates might not be 100% accurate
- Ghost inactivity/gone times might not be 100% accurate
- Captcha images are not 100% accurate (but it's impossible to make them 1:1 with MineXplorer)
- `map_ballpit_alt` requirements are not 100% accurate
- The map switch timers might be inaccurate
- Captcha expiry times might not be 100% accurate

# Version Compatibility
* `Guaranteed not working`: This version doesn't work with the server recreation.
* `Might work, not confirmed`: Due to similarities with another compatible version, it might work, but it hasn't been tested.
* `Guaranteed working`: This version works with the server recreation.
* `No available build`: A build of this version is not available and as such cannot be tested, although it is most likely not functional. This does **not** mean a build does not exist.
* `No available build (work)`: A build of this version is not available and as such cannot be tested, although it is most likely functional. This does **not** mean a build does not exist.

| Version (mexp) | Support Status            |
| -------------- | ------------------------- |
| 1              | No available build        |
| 2              | No available build        |
| 3              | Guaranteed not working    |
| 4              | Guaranteed not working    |
| 5              | No available build        |
| 6              | Guaranteed not working    |
| 7              | Guaranteed not working    |
| 8              | Guaranteed not working    |
| 9              | Guaranteed not working    |
| 10             | Guaranteed not working    |
| 11             | Guaranteed not working    |
| 12             | Guaranteed not working    |
| 13             | Guaranteed not working    |
| 14             | Guaranteed not working    |
| 15             | Guaranteed not working    |
| 16             | Guaranteed not working    |
| 17             | Guaranteed not working    |
| 18             | Guaranteed not working    |
| 19             | Guaranteed not working    |
| 20             | Guaranteed not working    |
| 21             | Guaranteed not working    |
| 23             | Guaranteed not working    |
| 24             | Guaranteed not working    |
| 25             | Guaranteed not working    |
| 26             | Guaranteed not working    |
| 27             | Guaranteed working        |
| 28             | Guaranteed working        |
| 29             | Guaranteed working        |
| 30             | Guaranteed working        |
| 31             | Guaranteed working        |
| 32             | Guaranteed working        |
| 33             | No available build (work) |
| 34             | No available build (work) |
| 35             | Guaranteed working        |
| 36             | Guaranteed working        |
| 37             | Guaranteed working        |