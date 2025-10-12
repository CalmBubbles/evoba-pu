if (pos.y >= 200) return input;

if (pos.Equals(new Vector2(0, 2))) return;

if (pos.y < 2 || Math.abs(noise.simplex2(pos.x / 30, pos.y / 30)) <= 0.5) return "pu:stone";

return input;