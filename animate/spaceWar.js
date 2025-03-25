document.addEventListener("DOMContentLoaded", function () {
    const heroSection = document.getElementById("hero-animation");

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, heroSection.clientWidth / heroSection.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
    heroSection.appendChild(renderer.domElement);

    // Bintang latar belakang
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 300;
    const positions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 100;
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Pesawat 3D
    const ship = new THREE.Group();
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;

    const wingGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.5);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const wing = new THREE.Mesh(wingGeometry, wingMaterial);
    wing.position.set(0, 0.3, 0);
    const wing2 = wing.clone();
    wing2.position.set(0, -0.3, 0);

    const tailGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.3);
    const tail = new THREE.Mesh(tailGeometry, wingMaterial);
    tail.position.set(0, -0.75, 0);

    ship.add(body, wing, wing2, tail);
    ship.position.set(0, -3, 0);
    scene.add(ship);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    scene.add(light);

    camera.position.set(0, 0, 7);
    camera.lookAt(ship.position);

    // List musuh & peluru
    let enemies = [];
    let bullets = [];
    let isGameOver = false;

    // Elemen teks game over
    const gameOverText = document.createElement("div");
    gameOverText.innerText = "Ooww";
    gameOverText.style.position = "absolute";
    gameOverText.style.top = "50%";
    gameOverText.style.left = "50%";
    gameOverText.style.transform = "translate(-50%, -50%)";
    gameOverText.style.fontSize = "20px";
    gameOverText.style.color = "red";
    gameOverText.style.display = "none";
    heroSection.appendChild(gameOverText);

    function spawnEnemy() {
        if (isGameOver) return;
        const enemyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
        enemy.position.set((Math.random() - 0.5) * 8, 5, 0);
        scene.add(enemy);
        enemies.push(enemy);
        setTimeout(spawnEnemy, 2000);
    }
    spawnEnemy();

    function shoot() {
        if (isGameOver) return;
        const bulletGeometry = new THREE.CylinderGeometry(0.2, 0.01, 0.01);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bullet.rotation.x = Math.PI / 2;
        bullet.position.set(ship.position.x, ship.position.y + 1, ship.position.z);
        scene.add(bullet);
        bullets.push(bullet);
    }
    setInterval(shoot, 500);

    function checkCollisions() {
        bullets.forEach((bullet, bulletIndex) => {
            enemies.forEach((enemy, enemyIndex) => {
                if (bullet.position.distanceTo(enemy.position) < 0.5) {
                    scene.remove(enemy);
                    scene.remove(bullet);
                    enemies.splice(enemyIndex, 1);
                    bullets.splice(bulletIndex, 1);
                }
            });
        });

        enemies.forEach(enemy => {
            if (ship.position.distanceTo(enemy.position) < 1) gameOver();
        });
    }

    function gameOver() {
        isGameOver = true;
        gameOverText.style.display = "block";
        document.addEventListener("click", restartGame, { once: true });
    }

    function restartGame() {
        isGameOver = false;
        gameOverText.style.display = "none";
        enemies.forEach(enemy => scene.remove(enemy));
        bullets.forEach(bullet => scene.remove(bullet));
        enemies = [];
        bullets = [];
        ship.position.set(0, -3, 0);
        animate();
        spawnEnemy();
    }
    

    function animate() {
        if (isGameOver) return;
        requestAnimationFrame(animate);

        enemies.forEach((enemy, index) => {
            enemy.position.y -= 0.02;
            if (enemy.position.y < -5) {
                scene.remove(enemy);
                enemies.splice(index, 1);
            }
        });

        bullets.forEach((bullet, index) => {
            bullet.position.y += 0.2;
            if (bullet.position.y > 5) {
                scene.remove(bullet);
                bullets.splice(index, 1);
            }
        });

        checkCollisions();
        renderer.render(scene, camera);
    }
    animate();

    // Mekanisme pergerakan pesawat
    let targetX = 0;
    const speed = 0.1;
    const boundaryX = 6;
    let isMoving = false;

    function startMoving() {
        isMoving = true;
    }

    function stopMoving() {
        isMoving = false;
    }

    document.addEventListener("mousedown", startMoving);
    document.addEventListener("mouseup", stopMoving);
    document.addEventListener("touchstart", startMoving);
    document.addEventListener("touchend", stopMoving);

    function updateTargetX(event) {
        let clientX = event.clientX || event.touches[0].clientX;
        if (isMoving) {
            targetX = ((clientX / window.innerWidth) * 2 - 1) * boundaryX;
        }
    }

    document.addEventListener("mousemove", updateTargetX);
    document.addEventListener("touchmove", updateTargetX);

    function updateShipPosition() {
        if (!isGameOver) {
            ship.position.x += (targetX - ship.position.x) * speed;
            ship.position.x = Math.max(-boundaryX, Math.min(boundaryX, ship.position.x));
        }
        requestAnimationFrame(updateShipPosition);
    }
    updateShipPosition();

    // Menyesuaikan ukuran saat layar diubah
    window.addEventListener("resize", () => {
        camera.aspect = heroSection.clientWidth / heroSection.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
    });
});
