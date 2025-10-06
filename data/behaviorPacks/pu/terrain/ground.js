if (pos.Equals(new Vector2(0, 2))) return;

if (pos.y < 2 || Math.random() <= 0.3) return Math.random() >= 0.2 ? "pu:dirt" : "pu:stone";

return input;