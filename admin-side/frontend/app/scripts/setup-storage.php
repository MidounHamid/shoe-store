<?php

// Script pour configurer le storage Laravel
echo "Configuration du storage Laravel...\n";

// Créer le lien symbolique pour le storage public
if (!file_exists(public_path('storage'))) {
    if (function_exists('symlink')) {
        symlink(storage_path('app/public'), public_path('storage'));
        echo "✅ Lien symbolique créé : public/storage -> storage/app/public\n";
    } else {
        echo "❌ Impossible de créer le lien symbolique. Exécutez manuellement :\n";
        echo "php artisan storage:link\n";
    }
} else {
    echo "✅ Lien symbolique déjà existant\n";
}

// Créer les dossiers nécessaires
$directories = [
    storage_path('app/public/clients'),
    storage_path('app/public/clients/documents'),
];

foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
        echo "✅ Dossier créé : $dir\n";
    } else {
        echo "✅ Dossier existant : $dir\n";
    }
}

// Vérifier les permissions
foreach ($directories as $dir) {
    if (is_writable($dir)) {
        echo "✅ Permissions OK : $dir\n";
    } else {
        echo "❌ Permissions insuffisantes : $dir\n";
        echo "Exécutez : chmod 755 $dir\n";
    }
}

echo "\n🎉 Configuration terminée !\n";
echo "Les images devraient maintenant être accessibles via :\n";
echo "http://votre-domaine/storage/clients/documents/nom-fichier.jpg\n";
?>
