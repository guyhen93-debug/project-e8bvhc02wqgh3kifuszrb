interface SirloinSteakIconProps {
    className?: string;
}

export const SirloinSteakIcon = ({ className = "" }: SirloinSteakIconProps) => {
    return (
        <div 
            className={`w-6 h-6 bg-contain bg-center bg-no-repeat ${className}`}
            style={{
                backgroundImage: `url('https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1765351962837-Generated-Image-December-10-2025-8-15AM.jpeg')`
            }}
        />
    );
};