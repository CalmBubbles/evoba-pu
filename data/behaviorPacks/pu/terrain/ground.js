if (pos.y >= 200) return input;

if (pos.Equals(new Vector2(0, 2))) return;

if (pos.y < 2 || Math.abs(noise.simplex2(pos.x / 30, pos.y / 30)) <= 0.5) return Math.abs(noise.simplex2(pos.x / 10, pos.y / 10)) > 0.1 ? "pu:dirt" : "pu:stone";

return input;