from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0002_remove_restaurant_created_at_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='menuitem',
            name='category',
            field=models.CharField(max_length=100, default='main'),
        ),
    ] 