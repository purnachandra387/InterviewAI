const roadmaps = require("../data/roadmaps");

exports.getRoadmap = (req, res) => {

  const { role } = req.body;

  const roadmap = roadmaps[role.toLowerCase()];

  if (!roadmap) {
    return res.json({
      message: "Roadmap not available for this role"
    });
  }

  res.json(roadmap);
};
