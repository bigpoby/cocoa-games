document.addEventListener("DOMContentLoaded", () => {
  //여기에 game.html 대신 본인 게임 html 이름 입력
  const URL_map = {
    "June-1001": "GGW-June-1001/dodgebox_game.html",
    thsaudgh8: "SMH-thsaudgh8/game.html",
    KHS25: "KHS-KHS25/game.html",
    DODOVX: "CJH-DODOVX/game.html",
  };

  // title 부분에 각자 게임 타이틀 입력
  const team_members = [
    { name: "고건우", id: "June-1001", title: "Dodgebox" },
    { name: "손명호", id: "thsaudgh8", title: "" },
    { name: "권혜숙", id: "KHS25", title: "" },
    { name: "최전호", id: "DODOVX", title: "" },
  ];

  const container = document.getElementById("teamContainer");

  team_members.forEach((member) => {
    const card = document.createElement("div");
    card.className = "card";

    // 본인 썸네일 파일명 : thumbnail 폴더에 본인id-thumbnail.jpg로 저장
    // ex) June-1001-thumbnail.jpg
    const thumbnail_img = `thumbnail/${member.id}-thumbnail.jpg`;
    const temp_thumbnail = "thumbnail/temp.png";

    card.innerHTML = `
            <img src="${thumbnail_img}" alt="${member.name}" class="card-img" onerror="this.src='${temp_thumbnail}'">
            <div class="card-body">
                <div class="game-title">${member.title}</div>
                <div class="member-name"><span lang="ko">${member.name}</span> / ${member.id}</div>
                <button class="play-game" data-name="${member.id}">Play Game</button>
            </div>
        `;

    container.appendChild(card);
  });

  document.querySelectorAll(".play-game").forEach((button) => {
    button.addEventListener("click", () => {
      const fileURL = URL_map[button.getAttribute("data-name")];
      window.open(fileURL, "_blank");
    });
  });
});
