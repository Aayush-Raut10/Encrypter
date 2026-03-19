def encypt_rail_fence(plain_text, rails):
    fence = [ [] for i in range(rails)] # create rails
    
    rail = 0
    direction = 1 # 1 = down, -1 = up

    for char in plain_text:
        fence[rail].append(char)
        rail += direction

        if rail == 0 or rail == rails - 1:
            direction *= -1

    cipher_text = ""
    for row in fence:
        cipher_text += ''.join(row)

    return cipher_text



def decrypt_rail_fence(cipher_text: str, rails: int) -> str:
    # create the pattern
    pattern = [0] * len(cipher_text)
    rail = 0
    direction = 1
    for i in range(len(cipher_text)):
        pattern[i] = rail
        rail += direction
        if rail == 0 or rail == rails - 1:
            direction *= -1

    # fill the rails with characters
    fence = [[] for _ in range(rails)]
    index = 0
    for r in range(rails):
        for i in range(len(cipher_text)):
            if pattern[i] == r:
                fence[r].append(cipher_text[index])
                index += 1

    # read off the plain text
    result = []
    rail_positions = [0] * rails
    for r in pattern:
        result.append(fence[r][rail_positions[r]])
        rail_positions[r] += 1

    return "".join(result)

