const BrandMark = ({ compact = false }) => (
  <div className={`brand-mark ${compact ? 'compact' : ''}`} aria-label="KametiApp">
    <span className="brand-mark-k">K</span>
  </div>
);

export default BrandMark;
